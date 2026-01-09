using ApiMonitor.Data;
using ApiMonitor.DTOs;
using ApiMonitor.Models;
using ApiMonitor.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ApiMonitor.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwt;

    public AuthController(AppDbContext db, JwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        if (req.Role is not ("Admin" or "Viewer"))
            return BadRequest("Role must be 'Admin' or 'Viewer'.");

        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict("Email already exists.");

        var user = new User
        {
            Email = req.Email.Trim().ToLowerInvariant(),
            DisplayName = req.DisplayName.Trim(),
            Role = req.Role,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var (token, exp) = _jwt.Generate(user);
        return Ok(new AuthResponse(token, exp, user.Email, user.Role, user.DisplayName));
    }
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(
    [FromBody] LoginRequest request) // <-- Utilise la nouvelle classe
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Email == request.Email.Trim().ToLowerInvariant());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Email ou mot de passe incorrect");

        var (token, exp) = _jwt.Generate(user);
        return Ok(new AuthResponse(token, exp, user.Email, user.Role, user.DisplayName));
    }

    [HttpGet("check-admin-exists")]
    [AllowAnonymous]
    public async Task<ActionResult<bool>> CheckAdminExists()
    {
        return await _db.Users.AnyAsync(u => u.Role == "Admin");
    }
}
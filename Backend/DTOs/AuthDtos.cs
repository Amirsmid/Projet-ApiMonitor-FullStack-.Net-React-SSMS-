using System.ComponentModel.DataAnnotations;

namespace ApiMonitor.DTOs;

// Gardez cette partie (ne changez pas)
public record RegisterRequest(
    [param: Required, EmailAddress] string Email,
    [param: Required, MinLength(3), MaxLength(100)] string DisplayName,
    [param: Required, MinLength(6)] string Password,
    [param: Required] string Role
);

// Remplacez le record LoginRequest par cette CLASSE :
public class LoginRequest
{
    [Required(ErrorMessage = "Email requis")]
    [EmailAddress(ErrorMessage = "Email invalide")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Mot de passe requis")]
    public required string Password { get; set; }
}

// Structure de réponse compatible avec le frontend
public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    string Email,
    string Role,
    string DisplayName
);

// Structure alternative pour le frontend si nécessaire
public record AuthResponseFrontend(
    string Token,
    UserInfo User
);

public record UserInfo(
    string Email,
    string DisplayName,
    string Role
);
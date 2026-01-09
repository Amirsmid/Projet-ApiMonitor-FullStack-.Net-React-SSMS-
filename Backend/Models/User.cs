using System.ComponentModel.DataAnnotations;

namespace ApiMonitor.Models;

public class User
{
    public int Id { get; set; }

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = "";

    [Required, MaxLength(100)]
    public string DisplayName { get; set; } = "";

    [Required]
    public string PasswordHash { get; set; } = "";

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Viewer";

    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
}
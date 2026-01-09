using System.Text;
using ApiMonitor.Data;
using ApiMonitor.Middleware;
using ApiMonitor.Models;
using ApiMonitor.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ApiMonitor.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Configuration de SignalR
builder.Services.AddSignalR();

// Configuration JWT
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton<JwtTokenService>();

// Configuration des services Survey
builder.Services.AddHttpClient<IAtreemoSurveyService, AtreemoSurveyService>();
builder.Services.AddScoped<IAtreemoSurveyService, AtreemoSurveyService>();

// Configuration de la base de donn�es
builder.Services.AddDbContext<AppDbContext>(opts =>
{
    opts.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Configuration de l'authentification
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        ClockSkew = TimeSpan.Zero
    };

    // Configuration pour SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(accessToken) &&
                context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Configuration des autorisations
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
    options.AddPolicy("ViewerOrAdmin", policy => policy.RequireRole("Viewer", "Admin"));
});

// Configuration des contr�leurs
builder.Services.AddControllers();

// Configuration Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ApiMonitor",
        Version = "v1",
        Description = "API Monitoring Tool",
        Contact = new OpenApiContact { Name = "Support", Email = "support@apimonitor.com" }
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme.",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new List<string>() }
    });
});

// Configuration CORS CORRIG�E
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3008")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Initialisation de la base de donn�es
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (!await db.Users.AnyAsync(u => u.Role == "Admin"))
    {
        var adminEmail = builder.Configuration["Admin:Email"] ?? "admin@local.test";
        var adminPassword = builder.Configuration["Admin:Password"] ?? "P@ssw0rd!";

        var admin = new User
        {
            Email = adminEmail,
            DisplayName = "System Admin",
            Role = "Admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword)
        };

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}

// Configuration du pipeline middleware
app.UseRouting();

// CORS doit �tre apr�s UseRouting() et avant UseAuthentication()
app.UseCors("AllowSpecificOrigins");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ApiMonitor v1");
    c.RoutePrefix = "swagger";
    c.DisplayRequestDuration();
    c.EnableTryItOutByDefault();
});

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseStaticFiles();

// Configuration des endpoints
app.MapControllers();
app.MapHub<LogsHub>("/hubs/logs");

// Redirection vers Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();
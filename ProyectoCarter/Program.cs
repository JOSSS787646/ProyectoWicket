using Carter;
using ProyectoCarter.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies; // Añade esto para autenticación por cookies


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCarter(); // Solo agregar Carter
builder.Services.AddSingleton<UsuarioRepository>(); // Registrar el repositorio

// Configura autenticación con cookies (o JWT si prefieres)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "AuthCookie";
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.AccessDeniedPath = "/access-denied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    });

// Configura autorización
builder.Services.AddAuthorization(options =>
{
    // Puedes definir políticas aquí si lo necesitas
    options.AddPolicy("RequireAuthenticatedUser", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

var app = builder.Build();

// Habilita la redirección HTTPS
app.UseHttpsRedirection();

// Servir archivos estáticos (CSS, JS, imágenes)
app.UseStaticFiles();

//Verificar Logs del servidor
app.UseDeveloperExceptionPage();

app.MapCarter();



// Middleware para manejar rutas no encontradas
app.Use(async (context, next) =>
{
    await next(); // Intenta procesar la solicitud

    if (context.Response.StatusCode == 404) // Si no se encontró una ruta válida
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync("wwwroot/views/error.html");
    }
});

app.Run();

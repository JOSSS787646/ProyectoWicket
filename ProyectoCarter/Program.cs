using Carter;
using ProyectoCarter.Repositories;
using Microsoft.AspNetCore.Authentication.Cookies; // A�ade esto para autenticaci�n por cookies


var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCarter(); // Solo agregar Carter
builder.Services.AddSingleton<UsuarioRepository>(); // Registrar el repositorio

// Configura autenticaci�n con cookies (o JWT si prefieres)
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "AuthCookie";
        options.LoginPath = "/login";
        options.LogoutPath = "/logout";
        options.AccessDeniedPath = "/access-denied";
        options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
    });

// Configura autorizaci�n
builder.Services.AddAuthorization(options =>
{
    // Puedes definir pol�ticas aqu� si lo necesitas
    options.AddPolicy("RequireAuthenticatedUser", policy =>
    {
        policy.RequireAuthenticatedUser();
    });
});

var app = builder.Build();

// Habilita la redirecci�n HTTPS
app.UseHttpsRedirection();

// Servir archivos est�ticos (CSS, JS, im�genes)
app.UseStaticFiles();

//Verificar Logs del servidor
app.UseDeveloperExceptionPage();

app.MapCarter();



// Middleware para manejar rutas no encontradas
app.Use(async (context, next) =>
{
    await next(); // Intenta procesar la solicitud

    if (context.Response.StatusCode == 404) // Si no se encontr� una ruta v�lida
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync("wwwroot/views/error.html");
    }
});

app.Run();

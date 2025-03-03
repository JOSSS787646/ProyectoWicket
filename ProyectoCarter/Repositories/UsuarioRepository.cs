using MySql.Data.MySqlClient;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;

namespace ProyectoCarter.Repositories
{
    public class UsuarioRepository
    {
        private readonly string _connectionString;
        public UsuarioRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }


        public async Task<Usuario?> GetByUsername(string username)
        {
            using var connection = GetConnection();
            return await connection.QueryFirstOrDefaultAsync<Usuario>(
                "SELECT Id, Nombre, Correo, Contraseña, RolId FROM Usuarios WHERE Nombre = @Nombre",
                new { Nombre = username }
            );
        }
        private MySqlConnection GetConnection() => new MySqlConnection(_connectionString);
        public async Task<IEnumerable<UsuarioDTO>> GetAll()
        {
            using var connection = GetConnection();
            return await connection.QueryAsync<UsuarioDTO>(
                @"SELECT u.Id, u.Nombre, u.Correo, u.RolId, r.Nombre AS Rol 
          FROM Usuarios u 
          LEFT JOIN Roles r ON u.RolId = r.Id");
        }
        public async Task<Usuario?> GetById(int id)
        {
            using var connection = GetConnection();
            return await connection.QueryFirstOrDefaultAsync<Usuario>("SELECT * FROM Usuarios WHERE Id = @Id", new { Id = id });
        }
        public async Task<int> Create(Usuario usuario)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync(
                "INSERT INTO Usuarios (Nombre, Correo, Contraseña, RolId) VALUES (@Nombre, @Correo, @Contraseña, @RolId)",
                usuario
            );
        }
        public async Task<int> Update(Usuario usuario)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync(
                "UPDATE Usuarios SET Nombre = @Nombre, Correo = @Correo, RolId = @RolId WHERE Id = @Id",
                usuario
            );
        }
        public async Task<int> Delete(int id)        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync("DELETE FROM Usuarios WHERE Id = @Id", new { Id = id });
        }
        public async Task<IEnumerable<Rol>> GetRoles()
        {
            using var connection = GetConnection();
            return await connection.QueryAsync<Rol>("SELECT Id, Nombre FROM Roles");
        }
        public async Task<int> CreateRole(Rol rol)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync(
                "INSERT INTO Roles (Nombre) VALUES (@Nombre)", rol
            );
        }


    }

    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Correo { get; set; }
        public string Contraseña { get; set; }  // Asegúrate de incluir esta propiedad
        public int RolId { get; set; }
    }

    public class UsuarioDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Correo { get; set; }
        public string Rol { get; set; }  // Se mostrará el nombre del rol
    }

    public class Rol
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
    }


}

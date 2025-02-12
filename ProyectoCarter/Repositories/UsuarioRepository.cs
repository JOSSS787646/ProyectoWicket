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

        private MySqlConnection GetConnection() => new MySqlConnection(_connectionString);

        public async Task<IEnumerable<Usuario>> GetAll()
        {
            using var connection = GetConnection();
            return await connection.QueryAsync<Usuario>("SELECT * FROM Usuarios");
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
                "INSERT INTO Usuarios (Nombre, Correo, RolId) VALUES (@Nombre, @Correo, @RolId)",
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

        public async Task<int> Delete(int id)
        {
            using var connection = GetConnection();
            return await connection.ExecuteAsync("DELETE FROM Usuarios WHERE Id = @Id", new { Id = id });
        }
    }

    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Correo { get; set; }
        public int RolId { get; set; }
    }
}

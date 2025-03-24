using System.Collections.Generic;
using System.Threading.Tasks;
using Dapper;
using MySql.Data.MySqlClient;
using ProyectoCarter.Repositories;

public class RolRepository
{
    private readonly string _connectionString;

    public RolRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<bool> ExisteRol(int id)
    {
        using var connection = new MySqlConnection(_connectionString);
        var query = "SELECT COUNT(*) FROM Roles WHERE Id = @Id";
        var count = await connection.ExecuteScalarAsync<int>(query, new { Id = id });
        return count > 0;
    }

    public async Task AgregarRol(int id, string nombre)
    {
        using var connection = new MySqlConnection(_connectionString);
        var query = "INSERT INTO Roles (Id, Nombre) VALUES (@Id, @Nombre)";
        await connection.ExecuteAsync(query, new { Id = id, Nombre = nombre });
    }

    public async Task<IEnumerable<dynamic>> ObtenerRoles()
    {
        using var connection = new MySqlConnection(_connectionString);
        var query = "SELECT * FROM Roles";
        return await connection.QueryAsync(query);
    }

    public async Task<IEnumerable<Rol>> ObtenerPerfiles()
    {
        using var connection = new MySqlConnection(_connectionString);
        var query = "SELECT Id, Nombre FROM Roles";
        return await connection.QueryAsync<Rol>(query);
    }

}

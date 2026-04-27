using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VideoBackend.DataAccessLayer.Context;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserContext _context;

    public UserController(UserContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
    {
        var users = await _context.Users.ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<User>> GetById(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<User>> Create([FromBody] User user)
    {
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<User>> Update(Guid id, [FromBody] User request)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser is null)
        {
            return NotFound();
        }

        existingUser.Username = request.Username;
        existingUser.Role = request.Role;
        existingUser.Email = request.Email;
        existingUser.Password = request.Password;
        existingUser.RegisterDate = request.RegisterDate;

        await _context.SaveChangesAsync();
        return Ok(existingUser);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existingUser = await _context.Users.FindAsync(id);
        if (existingUser is null)
        {
            return NotFound();
        }

        _context.Users.Remove(existingUser);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
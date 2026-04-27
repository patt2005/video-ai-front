using Microsoft.AspNetCore.Mvc;
using VideoBackend.BusinessLayer;
using VideoBackend.BusinessLayer.Interfaces;
using VideoBackend.Domain.Entities.User;

namespace VideoBackend.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    internal IUserAction _userAction;

    public UserController()
    {
        var bl = new BusinessLogic();
        _userAction = bl.UserAction();
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var users = _userAction.GetAllUsers();
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id)
    {
        var user = _userAction.GetUserById(id);
        if (user is null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public IActionResult Create([FromBody] User user)
    {
        var created = _userAction.CreateUser(user);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public IActionResult Update(Guid id, [FromBody] User request)
    {
        var updated = _userAction.UpdateUser(id, request);
        if (updated is null)
            return NotFound();

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
    {
        var deleted = _userAction.DeleteUser(id);
        if (!deleted)
            return NotFound();

        return NoContent();
    }
}

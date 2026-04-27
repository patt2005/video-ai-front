using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoBackend.DataAccessLayer.Migrations.Task
{
    /// <inheritdoc />
    public partial class DropDuplicateUserTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the FK that pointed Tasks.UserId → User (duplicate table)
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_User_UserId",
                table: "Tasks");

            // Drop the duplicate User table (Users already exists from UserContext)
            migrationBuilder.DropTable(
                name: "User");

            // Re-add the FK pointing Tasks.UserId → Users
            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_UserId",
                table: "Tasks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_UserId",
                table: "Tasks");

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    RegisterDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_User_UserId",
                table: "Tasks",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

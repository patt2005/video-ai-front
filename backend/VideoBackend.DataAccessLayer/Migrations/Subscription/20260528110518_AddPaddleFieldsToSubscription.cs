using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VideoBackend.DataAccessLayer.Migrations.Subscription
{
    /// <inheritdoc />
    public partial class AddPaddleFieldsToSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NextBillDate",
                table: "Subscriptions",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaddleCustomerId",
                table: "Subscriptions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaddleSubscriptionId",
                table: "Subscriptions",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NextBillDate",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "PaddleCustomerId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "PaddleSubscriptionId",
                table: "Subscriptions");
        }
    }
}

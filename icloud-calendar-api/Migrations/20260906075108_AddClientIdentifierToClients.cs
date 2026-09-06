using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace icloud_calendar_api.Migrations
{
    /// <inheritdoc />
    public partial class AddClientIdentifierToClients : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientIdentifier",
                table: "Clients",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_ClientIdentifier",
                table: "Clients",
                column: "ClientIdentifier",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Clients_ClientIdentifier",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "ClientIdentifier",
                table: "Clients");
        }
    }
}

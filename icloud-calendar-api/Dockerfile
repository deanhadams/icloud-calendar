FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

COPY ["icloud-calendar-api.csproj", "./"]

RUN dotnet restore "icloud-calendar-api.csproj"

COPY . .

RUN dotnet publish "icloud-calendar-api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "icloud-calendar-api.dll"]
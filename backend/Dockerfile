# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first for layer caching
COPY VideoBackend.sln ./
COPY VideoBackend.Api/VideoBackend.Api.csproj VideoBackend.Api/
COPY VideoBackend.BusinessLayer/VideoBackend.BusinessLayer.csproj VideoBackend.BusinessLayer/
COPY VideoBackend.DataAccessLayer/VideoBackend.DataAccessLayer.csproj VideoBackend.DataAccessLayer/
COPY VideoBackend.Domain/VideoBackend.Domain.csproj VideoBackend.Domain/

RUN dotnet restore

# Copy the rest of the source
COPY . .

# Publish the API project
RUN dotnet publish VideoBackend.Api/VideoBackend.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "VideoBackend.Api.dll"]

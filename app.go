package main

import (
	"context"
	"fmt"
	"metalite/backend"
	"strings"
)

// App struct
type App struct {
	ctx       context.Context
	sshClient *backend.SSHClient
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		sshClient: backend.NewSSHClient(),
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ConnectSSH connects to the remote server via SSH
func (a *App) ConnectSSH(host string, user string, keyPath string) string {
	err := a.sshClient.Connect(host, user, keyPath)
	if err != nil {
		return fmt.Sprintf("Error connecting: %v", err)
	}
	return ""
}

// ExecuteQuery executes a sqlite3 query on the remote server
func (a *App) ExecuteQuery(dbPath string, query string) string {
	// Use -json for JSON output, -header for headers if needed (but json handles keys)
	// We need to escape the query properly.
	// Simple approach: sqlite3 -json dbPath "query"
	// Note: Command injection risk if query is not sanitized, but this is a dev tool for the user.
	// We'll wrap the query in quotes.

	// Escape double quotes to prevent shell issues
	// " -> \"
	// This ensures that when we wrap the query in double quotes for the shell, internal double quotes don't break it.
	escapedQuery := strings.ReplaceAll(query, "\"", "\\\"")

	cmd := fmt.Sprintf("sqlite3 -json %s \"%s\"", dbPath, escapedQuery)
	output, err := a.sshClient.RunCommand(cmd)
	if err != nil {
		return fmt.Sprintf("Error executing query: %v", err)
	}
	return output
}

// GetSavedConnections returns the list of saved connections
func (a *App) GetSavedConnections() []backend.SavedConnection {
	conns, err := backend.LoadConnections()
	if err != nil {
		// Log error? For now return empty
		return []backend.SavedConnection{}
	}
	return conns
}

// SaveConnection saves a connection to the store
func (a *App) SaveConnection(conn backend.SavedConnection) string {
	err := backend.SaveConnection(conn)
	if err != nil {
		return fmt.Sprintf("Error saving: %v", err)
	}
	return ""
}

// DeleteConnection deletes a connection from the store
func (a *App) DeleteConnection(id string) string {
	err := backend.DeleteConnection(id)
	if err != nil {
		return fmt.Sprintf("Error deleting: %v", err)
	}
	return ""
}

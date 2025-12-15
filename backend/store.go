package backend

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type SavedConnection struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Host    string `json:"host"`
	User    string `json:"user"`
	KeyPath string `json:"keyPath"`
	DBPath  string `json:"dbPath"`
}

func GetConfigDir() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	configDir := filepath.Join(home, ".metalite")
	if _, err := os.Stat(configDir); os.IsNotExist(err) {
		err = os.MkdirAll(configDir, 0755)
		if err != nil {
			return "", err
		}
	}
	return configDir, nil
}

func LoadConnections() ([]SavedConnection, error) {
	configDir, err := GetConfigDir()
	if err != nil {
		return nil, err
	}
	filePath := filepath.Join(configDir, "connections.json")

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return []SavedConnection{}, nil
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	var connections []SavedConnection
	err = json.Unmarshal(data, &connections)
	if err != nil {
		return nil, err
	}
	return connections, nil
}

func SaveConnection(conn SavedConnection) error {
	connections, err := LoadConnections()
	if err != nil {
		return err
	}

	// Check if exists, update if so, else append
	found := false
	for i, c := range connections {
		if c.ID == conn.ID {
			connections[i] = conn
			found = true
			break
		}
	}
	if !found {
		connections = append(connections, conn)
	}

	configDir, err := GetConfigDir()
	if err != nil {
		return err
	}
	filePath := filepath.Join(configDir, "connections.json")

	data, err := json.MarshalIndent(connections, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filePath, data, 0644)
}

func DeleteConnection(id string) error {
	connections, err := LoadConnections()
	if err != nil {
		return err
	}

	newConnections := []SavedConnection{}
	for _, c := range connections {
		if c.ID != id {
			newConnections = append(newConnections, c)
		}
	}

	configDir, err := GetConfigDir()
	if err != nil {
		return err
	}
	filePath := filepath.Join(configDir, "connections.json")

	data, err := json.MarshalIndent(newConnections, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(filePath, data, 0644)
}

package backend

import (
	"bytes"
	"fmt"
	"os"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHClient struct {
	client *ssh.Client
}

func NewSSHClient() *SSHClient {
	return &SSHClient{}
}

func (s *SSHClient) Connect(host string, user string, keyPath string) error {
	key, err := os.ReadFile(keyPath)
	if err != nil {
		return fmt.Errorf("unable to read private key: %v", err)
	}

	signer, err := ssh.ParsePrivateKey(key)
	if err != nil {
		return fmt.Errorf("unable to parse private key: %v", err)
	}

	config := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // Note: In production, use KnownHosts
		Timeout:         5 * time.Second,
	}

	// Append port 22 if not present
	// Simple check, can be improved
	address := host
	if len(host) > 0 && host[0] != ':' && !containsPort(host) {
		address = host + ":22"
	}

	client, err := ssh.Dial("tcp", address, config)
	if err != nil {
		return fmt.Errorf("failed to dial: %v", err)
	}

	s.client = client
	return nil
}

func (s *SSHClient) RunCommand(cmd string) (string, error) {
	if s.client == nil {
		return "", fmt.Errorf("not connected")
	}

	session, err := s.client.NewSession()
	if err != nil {
		return "", fmt.Errorf("failed to create session: %v", err)
	}
	defer session.Close()

	var stdoutBuf bytes.Buffer
	var stderrBuf bytes.Buffer
	session.Stdout = &stdoutBuf
	session.Stderr = &stderrBuf

	err = session.Run(cmd)
	if err != nil {
		return "", fmt.Errorf("command execution failed: %v, stderr: %s", err, stderrBuf.String())
	}

	return stdoutBuf.String(), nil
}

func (s *SSHClient) Close() error {
	if s.client != nil {
		return s.client.Close()
	}
	return nil
}

func containsPort(host string) bool {
	for i := len(host) - 1; i >= 0; i-- {
		if host[i] == ':' {
			return true
		}
	}
	return false
}

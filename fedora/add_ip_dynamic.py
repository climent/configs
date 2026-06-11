import subprocess
import sys

def run_command(command):
    """Helper function to run shell commands safely."""
    try:
        result = subprocess.run(command, check=True, text=True, capture_output=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error executing: {' '.join(command)}")
        print(f"Details: {e.stderr.strip()}")
        sys.exit(1)

def add_secondary_ip(connection_name, new_ip_cidr):
    print(f"Target Connection: {connection_name}")
    print(f"Adding IP Address: {new_ip_cidr}")
    
    # 1. Modify the connection to append the secondary IP
    print("\nModifying NetworkManager profile...")
    modify_cmd = ["nmcli", "connection", "modify", connection_name, "+ipv4.addresses", new_ip_cidr]
    run_command(modify_cmd)
    print("✓ Profile updated successfully.")
    
    # 2. Restart the connection to apply changes
    print("\nApplying changes (restarting connection)...")
    up_cmd = ["nmcli", "connection", "up", connection_name]
    output = run_command(up_cmd)
    print(f"✓ {output}")
    
    # 3. Verify the configuration by finding the mapped interface name
    print("\nVerifying current interface status:")
    show_connection = ["nmcli", "-g", "connection.interface-name", "connection", "show", connection_name]
    iface = run_command(show_connection)
    
    if iface:
        status = run_command(["ip", "addr", "show", "dev", iface])
        print(status)
    else:
        print("✓ Success. Profile was updated, but device is currently detached.")

if __name__ == "__main__":
    # Ensure script is run as root/sudo
    if subprocess.run(["id", "-u"], capture_output=True).stdout.decode().strip() != "0":
        print("Error: This script must be run with sudo or as root.")
        sys.exit(1)
        
    # Validate command line arguments
    if len(sys.argv) < 3:
        print("Error: Missing arguments.")
        print("Usage:   sudo python3 add_ip_dynamic.py '<connection_name>' '<ip/cidr>'")
        print("Example: sudo python3 add_ip_dynamic.py 'Wired connection 1' '192.168.1.150/24'")
        sys.exit(1)
        
    # Extract arguments from terminal input
    target_connection = sys.argv[1]
    target_ip_cidr = sys.argv[2]
        
    add_secondary_ip(target_connection, target_ip_cidr)


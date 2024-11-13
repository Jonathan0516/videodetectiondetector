import nacos
import socket

# Nacos server configuration
SERVER_ADDRESSES = "localhost:8848"
NAMESPACE = "public"
USERNAME = "nacos"
PASSWORD = "nacos" 

# Initialize the Nacos client
nacos_client = nacos.NacosClient(SERVER_ADDRESSES, namespace=NAMESPACE, username=USERNAME, password=PASSWORD)

# Utility function to get local IP address
def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.254.254.254', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# Service registration function
def register_service(service_name, port):
    ip = get_local_ip()
    try:
        nacos_client.add_naming_instance(service_name, ip, port)
        print(f"Successfully registered service '{service_name}' with IP {ip} and port {port}")
    except Exception as e:
        print(f"Failed to register service '{service_name}': {e}")

# Service discovery function
def discover_service(service_name):
    try:
        service_instances = nacos_client.list_naming_instances(service_name)
        print(f"Discovered instances for service '{service_name}': {service_instances}")
        return service_instances
    except Exception as e:
        print(f"Failed to discover service '{service_name}': {e}")
        return None

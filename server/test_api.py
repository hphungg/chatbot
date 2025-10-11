import requests

# Assuming test.pdf exists in the server directory
files = [('files', open('test.pdf', 'rb'))]
data = {'query': 'what is donal color'}

response = requests.post("http://localhost:8000/search", files=files, data=data)
print("Status Code:", response.status_code)
print("Response Text:", repr(response.text))
try:
    print(response.json())
except Exception as e:
    print("Error parsing JSON:", e)

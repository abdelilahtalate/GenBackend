def test_register_user(client):
    """Test user registration - MANUAL"""
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'Test123!',
        'first_name': 'Test',
        'last_name': 'User'
    })
    
    assert response.status_code == 201
    assert response.json['user']['email'] == 'test@example.com'

def test_register_weak_password(client):
    """Test weak password rejection - MANUAL"""
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'weak',
        'first_name': 'Test',
        'last_name': 'User'
    })
    
    assert response.status_code == 400

def test_login_user(client):
    """Test user login - MANUAL"""
    # Register first
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'password': 'Test123!',
        'first_name': 'Test',
        'last_name': 'User'
    })
    
    # Login
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'Test123!'
    })
    
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_login_invalid_credentials(client):
    """Test login with invalid credentials - MANUAL"""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'wrong'
    })
    
    assert response.status_code == 401

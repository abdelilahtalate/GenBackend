def test_create_project(client, auth_token):
    """Test project creation - MANUAL"""
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    response = client.post('/api/projects', 
        json={
            'name': 'Test Project',
            'description': 'A test project',
            'generation_mode': 'manual'
        },
        headers=headers
    )
    
    assert response.status_code == 201
    assert response.json['project']['name'] == 'Test Project'

def test_list_projects(client, auth_token):
    """Test project listing - MANUAL"""
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    response = client.get('/api/projects', headers=headers)
    
    assert response.status_code == 200
    assert 'projects' in response.json

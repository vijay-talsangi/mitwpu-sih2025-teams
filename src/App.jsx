// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    let filtered = teams;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(team => 
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.members.some(member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    if (activeFilter === 'with-requests') {
      filtered = filtered.filter(team => team.joinRequests.length > 0);
    } else if (activeFilter === 'no-requests') {
      filtered = filtered.filter(team => team.joinRequests.length === 0);
    }
    
    setFilteredTeams(filtered);
  }, [searchTerm, teams, activeFilter]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('https://yuvasetu-5kqb.vercel.app/api/youth/teams/event/68a71741331cd81f6e0714a0');
      const data = await response.json();
      if (data.success) {
        setTeams(data.teams);
        setFilteredTeams(data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
  };

  const handleBackClick = () => {
    setSelectedTeam(null);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading teams...</p>
        </div>
      </div>
    );
  }

  if (selectedTeam) {
    return (
      <div className="app">
        <TeamDetail team={selectedTeam} onBack={handleBackClick} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Team Management</h1>
          <p>View and manage all participating teams</p>
        </div>
        
        <div className="controls-container">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by team name or member name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={activeFilter === 'all' ? 'active' : ''}
              onClick={() => setActiveFilter('all')}
            >
              All Teams
            </button>
            <button 
              className={activeFilter === 'with-requests' ? 'active' : ''}
              onClick={() => setActiveFilter('with-requests')}
            >
              With Requests
            </button>
            <button 
              className={activeFilter === 'no-requests' ? 'active' : ''}
              onClick={() => setActiveFilter('no-requests')}
            >
              No Requests
            </button>
          </div>
        </div>
      </header>
      
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{teams.length}</span>
          <span className="stat-label">Total Teams</span>
        </div>
        <div className="stat">
          <span className="stat-number">{teams.reduce((acc, team) => acc + team.members.length, 0)}</span>
          <span className="stat-label">Total Members</span>
        </div>
        <div className="stat">
          <span className="stat-number">{teams.reduce((acc, team) => acc + team.joinRequests.length, 0)}</span>
          <span className="stat-label">Pending Requests</span>
        </div>
      </div>
      
      <div className="teams-container">
        {filteredTeams.length === 0 ? (
          <div className="no-teams">
            <i className="fas fa-users"></i>
            <h3>No teams found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredTeams.map(team => (
            <TeamCard 
              key={team._id} 
              team={team} 
              onClick={() => handleTeamClick(team)}
            />
          ))
        )}
      </div>
    </div>
  );
}

const TeamCard = ({ team, onClick }) => {
  const maleCount = team.members.filter(m => m.gender === 'male').length;
  const femaleCount = team.members.filter(m => m.gender === 'female').length;
  
  return (
    <div className="team-card" onClick={onClick}>
      <div className="card-header">
        <h2 className="team-name">{team.name}</h2>
        <span className="member-count">{team.members.length} members</span>
      </div>
      
      <div className="team-leader">
        <i className="fas fa-crown"></i>
        <span>{team.leader.name}</span>
      </div>
      
      <div className="gender-stats">
        <div className="gender-stat">
          <i className="fas fa-male"></i>
          <span>{maleCount} Male</span>
        </div>
        <div className="gender-stat">
          <i className="fas fa-female"></i>
          <span>{femaleCount} Female</span>
        </div>
      </div>
      
      <div className="members-preview">
        {team.members.slice(0, 4).map(member => (
          <div key={member._id} className="avatar" title={member.name}>
            {member.name.charAt(0)}
          </div>
        ))}
        {team.members.length > 4 && (
          <div className="avatar more">+{team.members.length - 4}</div>
        )}
      </div>
      
      {team.joinRequests.length > 0 && (
        <div className="pending-requests">
          <i className="fas fa-clock"></i>
          <span>{team.joinRequests.length} pending request(s)</span>
        </div>
      )}
      
      <div className="card-footer">
        <span>Created: {new Date(team.createdAt).toLocaleDateString()}</span>
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );
};

const TeamDetail = ({ team, onBack }) => {
  const maleCount = team.members.filter(m => m.gender === 'male').length;
  const femaleCount = team.members.filter(m => m.gender === 'female').length;
  
  return (
    <div className="team-detail">
      <button className="back-button" onClick={onBack}>
        <i className="fas fa-arrow-left"></i>
        Back to Teams
      </button>
      
      <div className="detail-header">
        <div className="team-title">
          <h1>{team.name}</h1>
          <span className="team-id">ID: {team._id}</span>
        </div>
        
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-value">{team.members.length}</span>
            <span className="stat-label">Members</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{maleCount}</span>
            <span className="stat-label">Male</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{femaleCount}</span>
            <span className="stat-label">Female</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{team.joinRequests.length}</span>
            <span className="stat-label">Requests</span>
          </div>
        </div>
      </div>

      <div className="detail-sections">
        <div className="detail-section">
          <h2>
            <i className="fas fa-crown"></i>
            Team Leader
          </h2>
          <MemberDetail member={team.leader} isLeader={true} />
        </div>

        <div className="detail-section">
          <h2>
            <i className="fas fa-users"></i>
            Team Members ({team.members.length})
          </h2>
          <div className="members-grid">
            {team.members.map(member => (
              <MemberDetail key={member._id} member={member} />
            ))}
          </div>
        </div>

        {team.joinRequests.length > 0 && (
          <div className="detail-section">
            <h2>
              <i className="fas fa-clock"></i>
              Pending Join Requests ({team.joinRequests.length})
            </h2>
            <div className="requests-list">
              {team.joinRequests.map(request => (
                <div key={request._id} className="request-item">
                  <MemberDetail member={request.user} />
                  <div className="request-meta">
                    <i className="fas fa-calendar"></i>
                    Requested: {new Date(request.requestedAt).toLocaleString()}
                  </div>
                  <div className="request-actions">
                    <button className="btn-accept">
                      <i className="fas fa-check"></i>
                      Accept
                    </button>
                    <button className="btn-decline">
                      <i className="fas fa-times"></i>
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MemberDetail = ({ member, isLeader = false }) => {
  return (
    <div className="member-detail">
      <div className="member-avatar">
        {member.name.charAt(0)}
        {isLeader && <span className="leader-badge"><i className="fas fa-crown"></i></span>}
      </div>
      
      <div className="member-info">
        <h3>
          {member.name}
          <span className={`gender-badge ${member.gender}`}>
            <i className={member.gender === 'male' ? 'fas fa-mars' : 'fas fa-venus'}></i>
            {member.gender}
          </span>
        </h3>
        
        <div className="member-contact">
          <div className="contact-item">
            <i className="fas fa-envelope"></i>
            <span>{member.email}</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i>
            <span>{member.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
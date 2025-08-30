// ProblemStatements.js
import React, { useState, useEffect } from 'react';
import './ProblemStatements.css';

const ProblemStatements = () => {
  const [problemStatements, setProblemStatements] = useState([]);
  const [filteredStatements, setFilteredStatements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchProblemStatements();
  }, []);

  useEffect(() => {
    let filtered = problemStatements;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(statement => 
        statement.statementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        statement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        statement.registeredTeams.some(team => 
          team.members.some(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    }
    
    // Apply status filter
    if (activeFilter === 'with-teams') {
      filtered = filtered.filter(statement => statement.registeredTeams.length > 0);
    } else if (activeFilter === 'no-teams') {
      filtered = filtered.filter(statement => statement.registeredTeams.length === 0);
    }
    
    setFilteredStatements(filtered);
  }, [searchTerm, problemStatements, activeFilter]);

  const fetchProblemStatements = async () => {
    try {
      const response = await fetch('https://mitwpu-sih2025-teams-backend-1.onrender.com/api/proxy/ps');
      const data = await response.json();
      if (data.success) {
        setProblemStatements(data.problemStatements);
        setFilteredStatements(data.problemStatements);
      }
    } catch (error) {
      console.error('Error fetching problem statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatementClick = (statement) => {
    setSelectedStatement(statement);
  };

  const handleBackClick = () => {
    setSelectedStatement(null);
  };

  if (loading) {
    return (
      <div className="problem-statements">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading problem statements...</p>
        </div>
      </div>
    );
  }

  if (selectedStatement) {
    return (
      <div className="problem-statements">
        <ProblemStatementDetail statement={selectedStatement} onBack={handleBackClick} />
      </div>
    );
  }

  return (
    <div className="problem-statements">
      <header className="ps-header">
        <div className="header-content">
          <h1>Problem Statements</h1>
          <p>Browse and search through all available problem statements</p>
        </div>
        
        <div className="controls-container">
          <div className="search-container">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by ID, title, or team member name..."
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
              All Statements
            </button>
            <button 
              className={activeFilter === 'with-teams' ? 'active' : ''}
              onClick={() => setActiveFilter('with-teams')}
            >
              With Teams
            </button>
            <button 
              className={activeFilter === 'no-teams' ? 'active' : ''}
              onClick={() => setActiveFilter('no-teams')}
            >
              No Teams
            </button>
          </div>
        </div>
      </header>
      
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{problemStatements.length}</span>
          <span className="stat-label">Total Statements</span>
        </div>
        <div className="stat">
          <span className="stat-number">{problemStatements.filter(ps => ps.registeredTeams.length > 0).length}</span>
          <span className="stat-label">With Teams</span>
        </div>
        <div className="stat">
          <span className="stat-number">{problemStatements.reduce((acc, ps) => acc + ps.registeredTeams.length, 0)}</span>
          <span className="stat-label">Registered Teams</span>
        </div>
      </div>
      
      <div className="statements-container">
        {filteredStatements.length === 0 ? (
          <div className="no-statements">
            <i className="fas fa-file-alt"></i>
            <h3>No problem statements found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          filteredStatements.map(statement => (
            <ProblemStatementCard 
              key={statement._id} 
              statement={statement} 
              onClick={() => handleStatementClick(statement)}
            />
          ))
        )}
      </div>
    </div>
  );
};

const ProblemStatementCard = ({ statement, onClick }) => {
  return (
    <div className="statement-card" onClick={onClick}>
      <div className="card-header">
        <h2 className="statement-id">{statement.statementId}</h2>
        <span className={`status-badge ${statement.isActive ? 'active' : 'inactive'}`}>
          {statement.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>
      
      <h3 className="statement-title">{statement.title}</h3>
      
      <div className="statement-meta">
        <div className="meta-item">
          <i className="fas fa-layer-group"></i>
          <span>{statement.category}</span>
        </div>
        <div className="meta-item">
          <i className="fas fa-building"></i>
          <span>{statement.organization}</span>
        </div>
        <div className="meta-item">
          <i className="fas fa-users"></i>
          <span>{statement.registeredTeams.length} team(s)</span>
        </div>
      </div>
      
      <div className="card-footer">
        <span>Created: {new Date(statement.createdAt).toLocaleDateString()}</span>
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );
};

const ProblemStatementDetail = ({ statement, onBack }) => {
  return (
    <div className="statement-detail">
      <button className="back-button" onClick={onBack}>
        <i className="fas fa-arrow-left"></i>
        Back to Statements
      </button>
      
      <div className="detail-header">
        <div className="statement-title-section">
          <span className="statement-id">{statement.statementId}</span>
          <h1>{statement.title}</h1>
          <div className="status-container">
            <span className={`status-badge ${statement.isActive ? 'active' : 'inactive'}`}>
              {statement.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="created-date">
              Created: {new Date(statement.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-value">{statement.registeredTeams.length}</span>
            <span className="stat-label">Teams</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{statement.category}</span>
            <span className="stat-label">Category</span>
          </div>
          <div className="header-stat">
            <span className="stat-value">{statement.technologyBucket}</span>
            <span className="stat-label">Technology</span>
          </div>
        </div>
      </div>

      <div className="detail-sections">
        <div className="detail-section">
          <h2>
            <i className="fas fa-info-circle"></i>
            Description
          </h2>
          <div className="description-content">
            <p>{statement.description}</p>
          </div>
        </div>

        <div className="detail-section">
          <h2>
            <i className="fas fa-building"></i>
            Organization & Department
          </h2>
          <div className="org-details">
            <div className="org-item">
              <strong>Organization:</strong> {statement.organization}
            </div>
            <div className="org-item">
              <strong>Department:</strong> {statement.department}
            </div>
          </div>
        </div>

        {statement.registeredTeams.length > 0 && (
          <div className="detail-section">
            <h2>
              <i className="fas fa-users"></i>
              Registered Teams ({statement.registeredTeams.length})
            </h2>
            <div className="teams-list">
              {statement.registeredTeams.map(team => (
                <div key={team._id} className="team-item">
                  <h3>{team.name}</h3>
                  <div className="team-members">
                    <strong>Members:</strong>
                    <div className="members-list">
                      {team.members.map(member => (
                        <span key={member._id} className="member-tag">
                          {member.name} ({member.email})
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="team-leader">
                    <strong>Leader:</strong> {team.leader.name} ({team.leader.email})
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

export default ProblemStatements;
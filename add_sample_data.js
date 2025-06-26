// Script to add sample data for testing weekly insights
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function addSampleData() {
  const userId = "42669011";
  
  // Add sample tasks
  await pool.query(`
    INSERT INTO tasks (user_id, title, description, status, priority, category, created_at)
    VALUES 
    ($1, 'Complete project proposal', 'Write detailed project proposal for Q2', 'completed', 'high', 'work', NOW() - INTERVAL '2 days'),
    ($1, 'Review code changes', 'Review and approve pending pull requests', 'completed', 'medium', 'work', NOW() - INTERVAL '1 day'),
    ($1, 'Learn TypeScript', 'Complete TypeScript tutorial series', 'pending', 'medium', 'learning', NOW() - INTERVAL '3 days'),
    ($1, 'Exercise routine', 'Complete morning workout', 'completed', 'low', 'personal', NOW() - INTERVAL '1 day')
  `, [userId]);

  // Add sample focus sessions
  await pool.query(`
    INSERT INTO focus_sessions (user_id, type, duration, start_time, end_time, completed_duration)
    VALUES 
    ($1, 'pomodoro', 1500, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', 1500),
    ($1, 'pomodoro', 1500, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours', 1500),
    ($1, 'pomodoro', 1500, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours 30 minutes', 1200)
  `, [userId]);

  // Add sample notes
  await pool.query(`
    INSERT INTO notes (user_id, title, content, category, tags, created_at)
    VALUES 
    ($1, 'Project Planning Notes', 'Key insights from project planning meeting', 'work', ARRAY['planning', 'project'], NOW() - INTERVAL '1 day'),
    ($1, 'TypeScript Learning', 'Important TypeScript concepts and best practices', 'learning', ARRAY['typescript', 'development'], NOW() - INTERVAL '2 days')
  `, [userId]);

  // Add sample browser activities
  await pool.query(`
    INSERT INTO browser_activities (user_id, url, domain, duration, category, timestamp)
    VALUES 
    ($1, 'github.com', 'github.com', 3600, 'development', NOW() - INTERVAL '2 hours'),
    ($1, 'stackoverflow.com', 'stackoverflow.com', 1800, 'development', NOW() - INTERVAL '3 hours'),
    ($1, 'typescript.org', 'typescript.org', 2400, 'learning', NOW() - INTERVAL '1 day'),
    ($1, 'youtube.com', 'youtube.com', 1200, 'entertainment', NOW() - INTERVAL '4 hours'),
    ($1, 'notion.so', 'notion.so', 900, 'productivity', NOW() - INTERVAL '6 hours')
  `, [userId]);

  // Add sample journal entries
  await pool.query(`
    INSERT INTO journal_entries (user_id, date, content, mood, highlights, gratitude, challenges, tomorrow_goals, tags, weather)
    VALUES 
    ($1, CURRENT_DATE, 'Productive day working on the dashboard project', 'happy', 'Completed major features', 'Great team collaboration', 'TypeScript debugging', 'Finish weekly insights', ARRAY['work', 'coding'], 'sunny'),
    ($1, CURRENT_DATE - 1, 'Learning new technologies and planning ahead', 'focused', 'Made progress on learning goals', 'Access to great learning resources', 'Time management', 'Better task prioritization', ARRAY['learning'], 'cloudy')
  `, [userId]);

  // Add sample health metrics
  await pool.query(`
    INSERT INTO health_metrics (user_id, type, value, unit, recorded_at, metadata)
    VALUES 
    ($1, 'steps', 12500, 'count', NOW() - INTERVAL '1 day', '{"source": "apple_watch", "accuracy": 0.95}'),
    ($1, 'sleep', 7.5, 'hours', NOW() - INTERVAL '1 day', '{"source": "apple_watch", "accuracy": 0.85}'),
    ($1, 'heartRate', 72, 'bpm', NOW() - INTERVAL '1 day', '{"source": "apple_watch", "accuracy": 0.98}'),
    ($1, 'calories', 2200, 'cal', NOW() - INTERVAL '1 day', '{"source": "apple_watch", "accuracy": 0.90}')
  `, [userId]);

  console.log('Sample data added successfully!');
}

addSampleData().catch(console.error).finally(() => pool.end());
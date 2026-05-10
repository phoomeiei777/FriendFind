const mysql = require('mysql2/promise');

async function cleanup() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'friendfind_root',
    database: 'study_match_db'
  });

  try {
    console.log('Finding ghost groups...');
    const [groups] = await connection.execute('SELECT id FROM study_groups');
    
    for (const group of groups) {
      const [members] = await connection.execute('SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND join_status = "approved"', [group.id]);
      if (members[0].count === 0) {
        console.log(`Deleting ghost group: ${group.id}`);
        await connection.execute('DELETE FROM group_members WHERE group_id = ?', [group.id]);
        await connection.execute('DELETE FROM study_groups WHERE id = ?', [group.id]);
      }
    }
    console.log('Cleanup complete!');
  } catch (e) {
    console.error(e);
  } finally {
    await connection.end();
  }
}

cleanup();

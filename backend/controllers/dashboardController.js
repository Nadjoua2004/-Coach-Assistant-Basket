const supabase = require('../config/database');

class DashboardController {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      // Get total athletes
      const { count: totalAthletes } = await supabase
        .from('athletes')
        .select('*', { count: 'exact', head: true });

      // Get active athletes (not injured)
      const { count: activeAthletes } = await supabase
        .from('athletes')
        .select('*', { count: 'exact', head: true })
        .eq('blesse', false);

      // Get injured athletes
      const { count: injuredAthletes } = await supabase
        .from('athletes')
        .select('*', { count: 'exact', head: true })
        .eq('blesse', true);

      // Get sessions this week
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { count: sessionsThisWeek } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString());

      // Get attendance rate (simplified)
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('status');

      const totalRecords = attendanceRecords?.length || 0;
      const presentRecords = attendanceRecords?.filter(r => r.status === 'present').length || 0;
      const attendanceRate = totalRecords > 0
        ? ((presentRecords / totalRecords) * 100).toFixed(1)
        : 0;

      // Get recently registered players (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: recentPlayers } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('role', 'joueur')
        .gte('created_at', lastWeek.toISOString())
        .order('created_at', { ascending: false });

      res.json({
        success: true,
        data: {
          totalAthletes: totalAthletes || 0,
          activeAthletes: activeAthletes || 0,
          injuredAthletes: injuredAthletes || 0,
          sessionsThisWeek: sessionsThisWeek || 0,
          attendanceRate: parseFloat(attendanceRate),
          recentPlayers: recentPlayers || []
        }
      });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = DashboardController;


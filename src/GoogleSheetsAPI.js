const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzW29Q_796NhbF32lcZknKjBkKutimAr7_2yngEZFaeJNktOIZe-G47hhx5JBX53L4/exec';

export const GoogleSheetsAPI = {
  async getPendingSubmissions() {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getPendingSubmissions`);
      const data = await response.json();
      return data.submissions || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
  },

  async getApprovedLocations() {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getApprovedLocations`);
      const data = await response.json();
      return data.locations || [];
    } catch (error) {
      console.error('Error fetching approved locations:', error);
      return [];
    }
  },

  async updateSubmissionStatus(rowId, status, reviewedBy = 'admin') {
    try {
      const url = `${GOOGLE_SCRIPT_URL}?action=updateSubmissionStatus&rowId=${rowId}&status=${status}&reviewedBy=${reviewedBy}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      return {
        success: data.success,
        approvedLocation: data.approvedLocation
      };
    } catch (error) {
      console.error('Error updating submission status:', error);
      return { success: false };
    }
  }
};
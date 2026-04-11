(function() {

  if (window.location.pathname.includes('dashboard.html')) {
    const session = localStorage.getItem('qsci_session') || sessionStorage.getItem('qsci_session');
    
    if (!session) {

      window.location.href = './index.html';
    }
  }
})();


window.logout = function() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('qsci_session');
    sessionStorage.removeItem('qsci_session');
    window.location.href = './index.html';
  }
};

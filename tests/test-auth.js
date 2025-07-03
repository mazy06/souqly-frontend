// Script de test pour la persistance de l'authentification
// À exécuter dans la console de l'app React Native

const testAuthPersistence = async () => {
  console.log('🧪 Test de persistance de l\'authentification');
  
  try {
    // 1. Test de connexion
    console.log('\n1️⃣ Test de connexion...');
    const loginResult = await AuthService.signInWithEmail('admin@souqly.com', 'admin123');
    console.log('✅ Connexion:', loginResult.success ? 'SUCCÈS' : 'ÉCHEC');
    
    if (loginResult.success) {
      // 2. Vérification du stockage des tokens
      console.log('\n2️⃣ Vérification du stockage des tokens...');
      const tokenData = await TokenService.getTokenData();
      console.log('✅ Tokens stockés:', tokenData ? 'OUI' : 'NON');
      
      if (tokenData) {
        console.log('   - Access Token:', tokenData.accessToken ? '✅' : '❌');
        console.log('   - Refresh Token:', tokenData.refreshToken ? '✅' : '❌');
        console.log('   - User ID:', tokenData.userId);
        console.log('   - User Role:', tokenData.userRole);
      }
      
      // 3. Test de vérification d'authentification
      console.log('\n3️⃣ Test de vérification d\'authentification...');
      const isAuth = await TokenService.isAuthenticated();
      console.log('✅ Utilisateur authentifié:', isAuth ? 'OUI' : 'NON');
      
      // 4. Test de vérification d'expiration
      console.log('\n4️⃣ Test de vérification d\'expiration...');
      const isExpired = await TokenService.isTokenExpired();
      console.log('✅ Token expiré:', isExpired ? 'OUI' : 'NON');
      
      // 5. Test d'appel API avec token
      console.log('\n5️⃣ Test d\'appel API avec token...');
      try {
        const userInfo = await ApiService.get('/auth/me');
        console.log('✅ Appel API réussi:', userInfo ? 'OUI' : 'NON');
        if (userInfo) {
          console.log('   - User ID:', userInfo.id);
          console.log('   - Email:', userInfo.email);
          console.log('   - Role:', userInfo.role);
        }
      } catch (error) {
        console.log('❌ Appel API échoué:', error.message);
      }
      
      // 6. Test de déconnexion
      console.log('\n6️⃣ Test de déconnexion...');
      await AuthService.logout();
      const isAuthAfterLogout = await TokenService.isAuthenticated();
      console.log('✅ Déconnexion réussie:', !isAuthAfterLogout ? 'OUI' : 'NON');
      
      // 7. Test de persistance après redémarrage (simulation)
      console.log('\n7️⃣ Test de persistance après redémarrage...');
      console.log('   (Simulation - dans une vraie app, redémarrez l\'app)');
      console.log('   L\'utilisateur devrait être automatiquement connecté si les tokens sont valides');
      
    } else {
      console.log('❌ Impossible de continuer les tests sans connexion réussie');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
  
  console.log('\n🏁 Tests terminés');
};

// Fonction pour tester le refresh token
const testTokenRefresh = async () => {
  console.log('🔄 Test de refresh de token');
  
  try {
    // 1. Se connecter
    const loginResult = await AuthService.signInWithEmail('admin@souqly.com', 'admin123');
    if (!loginResult.success) {
      console.log('❌ Connexion échouée');
      return;
    }
    
    // 2. Récupérer le refresh token
    const refreshToken = await TokenService.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ Pas de refresh token');
      return;
    }
    
    // 3. Simuler un refresh (normalement fait automatiquement par ApiService)
    console.log('✅ Refresh token disponible:', refreshToken.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ Erreur lors du test de refresh:', error);
  }
};

// Fonction pour afficher les informations de debug
const debugAuthState = async () => {
  console.log('🔍 État de l\'authentification');
  
  try {
    const tokenData = await TokenService.getTokenData();
    const isAuth = await TokenService.isAuthenticated();
    const isExpired = await TokenService.isTokenExpired();
    
    console.log('📊 État actuel:');
    console.log('   - Tokens stockés:', tokenData ? 'OUI' : 'NON');
    console.log('   - Authentifié:', isAuth ? 'OUI' : 'NON');
    console.log('   - Token expiré:', isExpired ? 'OUI' : 'NON');
    
    if (tokenData) {
      console.log('📋 Détails des tokens:');
      console.log('   - User ID:', tokenData.userId);
      console.log('   - User Role:', tokenData.userRole);
      console.log('   - Expires At:', new Date(tokenData.expiresAt).toLocaleString());
      console.log('   - Current Time:', new Date().toLocaleString());
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  }
};

// Exporter les fonctions pour les utiliser dans la console
global.testAuthPersistence = testAuthPersistence;
global.testTokenRefresh = testTokenRefresh;
global.debugAuthState = debugAuthState;

console.log('🚀 Scripts de test chargés:');
console.log('   - testAuthPersistence() : Test complet de persistance');
console.log('   - testTokenRefresh() : Test de refresh de token');
console.log('   - debugAuthState() : Affichage de l\'état actuel'); 
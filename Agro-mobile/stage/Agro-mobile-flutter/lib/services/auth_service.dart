import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;

  AuthService() {
    _loadUserFromStorage();
  }

  Future<void> _loadUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    final userName = prefs.getString('user_name');
    final userEmail = prefs.getString('user_email');
    final userPhoto = prefs.getString('user_photo');

    if (userId != null && userName != null && userEmail != null) {
      _currentUser = User(
        id: userId,
        name: userName,
        email: userEmail,
        photoUrl: userPhoto,
      );
      notifyListeners();
    }
  }

  Future<void> _saveUserToStorage(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_id', user.id);
    await prefs.setString('user_name', user.name);
    await prefs.setString('user_email', user.email);
    if (user.photoUrl != null) {
      await prefs.setString('user_photo', user.photoUrl!);
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      _isLoading = true;
      notifyListeners();

      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentUser = User(
        id: googleUser.id,
        name: googleUser.displayName ?? '',
        email: googleUser.email,
        photoUrl: googleUser.photoUrl,
      );

      await _saveUserToStorage(_currentUser!);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signInWithApple() async {
    try {
      _isLoading = true;
      notifyListeners();

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      final fullName = credential.givenName != null && credential.familyName != null
          ? '${credential.givenName} ${credential.familyName}'
          : 'Apple User';

      _currentUser = User(
        id: credential.userIdentifier ?? '',
        name: fullName,
        email: credential.email ?? '',
        photoUrl: null,
      );

      await _saveUserToStorage(_currentUser!);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (error) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signInWithEmail(String email, String password) async {
    try {
      _isLoading = true;
      notifyListeners();

      await Future.delayed(const Duration(seconds: 2));

      if (email == 'demo@agrowise.com' && password == 'password') {
        _currentUser = User(
          id: 'demo_user',
          name: 'Demo User',
          email: email,
          photoUrl: null,
        );

        await _saveUserToStorage(_currentUser!);
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _isLoading = false;
      notifyListeners();
      return false;
    } catch (error) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    try {
      await _googleSignIn.signOut();
      
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      
      _currentUser = null;
      notifyListeners();
    } catch (error) {
      if (kDebugMode) {
        print('Error signing out: $error');
      }
    }
  }
}
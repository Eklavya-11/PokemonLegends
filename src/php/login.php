<!-- not uploading php files --->

<?php
session_start();

// Check if user is already logged in
if(isset($_SESSION['user_id'])) {
  // Redirect to home page
  header("Location: home.php");
  exit;
}

// Check if the form has been submitted
if($_SERVER['REQUEST_METHOD'] == 'POST') {
  // Retrieve user input
  $username = $_POST['username'];
  $password = $_POST['password'];

  // Connect to the MySQL database
  $conn = mysqli_connect('localhost', 'username', 'password', 'database_name');

  // Check connection
  if(!$conn) {
    die("Connection failed: " . mysqli_connect_error());
  }

  // Prepare the SQL statement
  $sql = "SELECT * FROM users WHERE username='$username'";

  // Execute the SQL statement
  $result = mysqli_query($conn, $sql);

  // Check if the query returned any results
  if(mysqli_num_rows($result) > 0) {
    // Fetch the user data
    $user = mysqli_fetch_assoc($result);

    // Check if the password is correct
    if(password_verify($password, $user['password'])) {
      // Set session variables
      $_SESSION['user_id'] = $user['id'];
      $_SESSION['username'] = $user['username'];

      // Redirect to home page
      header("Location: home.php");
      exit;
    } else {
      // Invalid password
      $error = 'Invalid username or password';
    }
  } else {
    // Invalid username
    $error = 'Invalid username or password';
  }

  // Close the database connection
  mysqli_close($conn);
}
?>

<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
</head>
<body>
  <h1>Login</h1>
  <?php if(isset($error)) { ?>
    <p><?php echo $error; ?></p>
  <?php } ?>
  <form method="POST" action="">
    <label>Username:</label>
    <input type="text" name="username" required>
    <br>
    <label>Password:</label>
    <input type="password" name="password" required>
    <br>
    <input type="submit" value="Login">
  </form>
</body>
</html>

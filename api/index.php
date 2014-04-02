<?php
require 'Slim/Slim.php';

$app = new Slim();

$app->get('/players', 'getPlayers');
$app->get('/players/:id', 'getPlayer');
$app->post('/players', 'addPlayer');

$app->get('/games', 'getGames');
$app->get('/games/:id', 'getGame');
$app->post('/games', 'addGame');

$app->get('/points/:game', 'getPoints');
$app->post('/points', 'addPoint');

$app->run();

function getPlayers() {
	$sql = "select * FROM players ORDER BY name";
	try {
		$db = getConnection();
		$stmt = $db->query($sql);  
		$players = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($players);
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getPlayer($id) {
	$sql = "SELECT * FROM players WHERE id=:id";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("id", $id);
		$stmt->execute();
		$player = $stmt->fetchObject();  
		$db = null;
		echo json_encode($player); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function addPlayer() {
	$request = Slim::getInstance()->request();
	$player = $request->post();
	$sql = "INSERT INTO players (id, name, score) VALUES (null, :name, :score)";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("name", $player['name']);
		$stmt->bindParam("score", $player['score']);
		$stmt->execute();
		$player['id'] = $db->lastInsertId();
		$db = null;
		echo json_encode($player); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getGames() {
	$sql = "select * FROM games ORDER BY id";
	try {
		$db = getConnection();
		$stmt = $db->query($sql);  
		$games = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($games);
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getGame($id) {
	$sql = "SELECT * FROM games WHERE id=:id";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("id", $id);
		$stmt->execute();
		$game = $stmt->fetchObject();  
		$db = null;
		echo json_encode($game); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function addGame() {
	$request = Slim::getInstance()->request();
	$game = $request->post();
	$sql = "INSERT INTO games (id, status, time) VALUES (null, default, default)";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->execute();
		$game['id'] = $db->lastInsertId();
		$db = null;
		echo json_encode($game); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getPoints($game) {
	$sql = "SELECT * FROM points WHERE game=:game ORDER BY id";
	try {
		$db = getConnection();
		$stmt = $db->query($sql);
		$stmt->bindParam("game", $game);
		$points = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($points);
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function addPoint() {
	$request = Slim::getInstance()->request();
	$point = $request->post();
	$sql = "INSERT INTO points (id, server, receiver, winner, how, game) VALUES (null, :server, :receiver, :winner, :how, :game)";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("server", $player['server']);
		$stmt->bindParam("score", $player['score']);
		$stmt->bindParam("receiver", $player['receiver']);
		$stmt->bindParam("winner", $player['winner']);
		$stmt->bindParam("how", $player['how']);
		$stmt->bindParam("game", $player['game']);
		$stmt->execute();
		$point['id'] = $db->lastInsertId();
		$db = null;
		echo json_encode($point); 
	} catch(PDOException $e) {
		error_log($e->getMessage(), 3, '/var/tmp/php.log');
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function updateWine($id) {
	$request = Slim::getInstance()->request();
	$body = $request->getBody();
	$wine = json_decode($body);
	$sql = "UPDATE wine SET name=:name, grapes=:grapes, country=:country, region=:region, year=:year, description=:description, picture=:picture WHERE id=:id";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("name", $wine->name);
		$stmt->bindParam("grapes", $wine->grapes);
		$stmt->bindParam("country", $wine->country);
		$stmt->bindParam("region", $wine->region);
		$stmt->bindParam("year", $wine->year);
		$stmt->bindParam("description", $wine->description);
		$stmt->bindParam("picture", $wine->picture);
		$stmt->bindParam("id", $id);
		$stmt->execute();
		$db = null;
		echo json_encode($wine); 
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function deleteWine($id) {
	$sql = "DELETE FROM wine WHERE id=:id";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);  
		$stmt->bindParam("id", $id);
		$stmt->execute();
		$db = null;
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function findByName($query) {
	$sql = "SELECT * FROM wine WHERE UPPER(name) LIKE :query ORDER BY name";
	try {
		$db = getConnection();
		$stmt = $db->prepare($sql);
		$query = "%".$query."%";  
		$stmt->bindParam("query", $query);
		$stmt->execute();
		$wines = $stmt->fetchAll(PDO::FETCH_OBJ);
		$db = null;
		echo json_encode($wines);
	} catch(PDOException $e) {
		echo '{"error":{"text":'. $e->getMessage() .'}}'; 
	}
}

function getConnection() {
	$dbhost="127.0.0.1";
	$dbuser="root";
	$dbpass="Cazzer1!";
	$dbname="cutthroat";
	$dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);	
	$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
	return $dbh;
}

?>
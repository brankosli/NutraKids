<?php
class Database {
    private $connection;
    private $stmt;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        $this->connection = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
        if ($this->connection->connect_error) {
            throw new Exception('Database connection error: ' . $this->connection->connect_error);
        }
        $this->connection->set_charset('utf8mb4');
    }

    public function prepare($sql) {
        $this->stmt = $this->connection->prepare($sql);
        if (!$this->stmt) {
            throw new Exception('Prepare error: ' . $this->connection->error);
        }
        return $this;
    }

    public function bind($params) {
        if (empty($params)) return $this;
        $types = '';
        $values = [];
        foreach ($params as $param) {
            $types .= $param['type'];
            $values[] = &$param['value'];
        }
        array_unshift($values, $types);
        call_user_func_array([$this->stmt, 'bind_param'], $values);
        return $this;
    }

    public function execute() {
        return $this->stmt->execute();
    }

    public function getResult() {
        return $this->stmt->get_result();
    }

    public function fetch() {
        return $this->getResult()->fetch_assoc();
    }

    public function fetchAll() {
        return $this->getResult()->fetch_all(MYSQLI_ASSOC);
    }

    public function getAffectedRows() {
        return $this->connection->affected_rows;
    }

    public function getLastId() {
        return $this->connection->insert_id;
    }

    public function close() {
        if ($this->stmt) {
            $this->stmt->close();
        }
        $this->connection->close();
    }
}
?>

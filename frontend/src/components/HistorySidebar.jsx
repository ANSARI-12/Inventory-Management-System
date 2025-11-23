import React, { useEffect, useState } from "react";
import { getHistory } from "../api";

export default function HistorySidebar({ productId, onClose }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (productId) {
      getHistory(productId).then((res) => setLogs(res.data));
    }
  }, [productId]);

  return (
    <div className="sidebar open">
      <div className="sidebar-header">
        <h3>History (ID: {productId})</h3>
        <button onClick={onClose}>X</button>
      </div>
      <div className="logs">
        {logs.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                <small>{new Date(log.timestamp).toLocaleString()}</small>
                <p>Changed by: {log.changed_by}</p>
                <div>
                  <span className="old-val">{log.old_stock}</span>→
                  <span className="new-val">{log.new_stock}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

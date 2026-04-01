import { Link } from "react-router-dom";
import './Doc.css';

const SWAGGER_UI_URL = "http://localhost:8080/docs";
const OPENAPI_JSON_URL = "http://localhost:8080/v3/api-docs";

export default function Doc() {
	return (
		<main className="doc-page">
			<section className="doc-panel">
				<h1>API Documentation</h1>
				<p>Access Swagger and the OpenAPI schema</p>

				<div className="doc-actions">
					<a href={SWAGGER_UI_URL} target="_blank" rel="noreferrer" className="cta">
						Open Swagger UI
					</a>
					<a href={OPENAPI_JSON_URL} target="_blank" rel="noreferrer">
						Open OpenAPI JSON
					</a>
					<Link to="/home">Home</Link>
				</div>

				<div className="doc-quickstart">
					<h2>Quick start</h2>
					<ol>
						<li>Start the backend on port 8080.</li>
						<li>Open Swagger UI and authorize if needed.</li>
						<li>Use OpenAPI JSON for Postman/import or client generation.</li>
					</ol>
				</div>
			</section>
		</main>
	);
}

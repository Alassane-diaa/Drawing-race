import { Link } from "react-router-dom";

const SWAGGER_UI_URL = "http://localhost:8080/docs";
const OPENAPI_JSON_URL = "http://localhost:8080/v3/api-docs";

export default function Doc() {
	return (
		<main style={{
			minHeight: "100vh",
			padding: "2rem",
			fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
			background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
			color: "#0f172a"
		}}>
			<section style={{
				maxWidth: "900px",
				margin: "0 auto",
				background: "white",
				borderRadius: "16px",
				padding: "2rem",
				boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
			}}>
				<h1 style={{ marginTop: 0 }}>API Documentation</h1>
				<p>
					Documentation / Swagger API
				</p>

				<div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
					<a
						href={SWAGGER_UI_URL}
						target="_blank"
						rel="noreferrer"
						style={{
							display: "inline-block",
							padding: "0.75rem 1rem",
							borderRadius: "10px",
							background: "#2563eb",
							color: "white",
							textDecoration: "none",
							fontWeight: 600
						}}
					>
						Open Swagger UI
					</a>
					<a
						href={OPENAPI_JSON_URL}
						target="_blank"
						rel="noreferrer"
						style={{
							display: "inline-block",
							padding: "0.75rem 1rem",
							borderRadius: "10px",
							border: "1px solid #cbd5e1",
							color: "#0f172a",
							textDecoration: "none",
							fontWeight: 600
						}}
					>
						Open OpenAPI JSON
					</a>
					<Link
						to="/home"
						style={{
							display: "inline-block",
							padding: "0.75rem 1rem",
							borderRadius: "10px",
							border: "1px solid #cbd5e1",
							color: "#0f172a",
							textDecoration: "none",
							fontWeight: 600
						}}
					>
						Home
					</Link>
				</div>

				<h2 style={{ marginTop: "2rem" }}>Quick Start</h2>
				<ol>
					<li>Start backend server on port 8080.</li>
					<li>Open Swagger UI and authorize if needed for protected endpoints.</li>
					<li>Use OpenAPI JSON for Postman/import or code generation.</li>
				</ol>
			</section>
		</main>
	);
}

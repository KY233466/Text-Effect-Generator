import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		height: 'calc(100% - 65px)',
	},
	content: {
		flex: 1,
		overflowY: 'auto'
	},
	label: {
		color: "#06001A",
		fontSize: "14px",
		fontFamily: "Avenir Next",
		fontWeight: "600",
		marginBottom: "8px",
		display: "block"
	},
	shapeContainer: {
		display: 'flex',
		flexDirection: 'row',
		gap: '10px',
		marginBottom: '24px'
	},
	shapeButton: {
		width: '85px',
		height: '85px',
		borderRadius: '10px',
		border: '1px solid #CBE2FF',
		cursor: 'pointer',
		backgroundColor: 'white',
		fontSize: '14px',
		fontFamily: 'Avenir Next',
		fontWeight: '500',
		transition: 'all 0.3s ease',
		outline: 'none',
	},
	shapeButtonSelected: {
		backgroundColor: '#EBF3FE',
		borderColor: '#CBE2FF',
		outline: 'none',
	},
	buttonGroup: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginTop: '20px'
	},
	insertButton: {
		border: 'none',
		borderRadius: '8px',
		fontSize: '14px',
		fontFamily: 'Avenir Next',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		width: '100%',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
		padding: '12px 24px',
		background: '#1178FF',
		color: 'white'
	},
	insertButtonDisabled: {
		border: 'none',
		borderRadius: '8px',
		fontSize: '14px',
		width: '100%',
		fontFamily: 'Avenir Next',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		minWidth: '120px',
		boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
		padding: '12px 24px',
		backgroundColor: '#ccc',
		color: '#666',
		cursor: 'not-allowed',
		transform: 'none',
		boxShadow: 'none'
	},
	errorMessage: {
		color: '#dc3545',
		backgroundColor: '#f8d7da',
		border: '1px solid #f5c6cb',
		padding: '8px 12px',
		borderRadius: '4px',
		textAlign: 'center',
		marginTop: '12px'
	}
};

const CustomTextPage = ({
	sandboxProxy,
	text,
	fontUrl,
	lineHeight,
	letterSpacing,
	alignment }) => {

	const Shape = ["mesh", "smudge"];
	const [selected, setSelected] = useState("mesh");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	const [svgPath, setSvgPath] = useState("");
	const [pathBounds, setPathBounds] = useState(null);

	const handleInsert = async () => {
		if (!sandboxProxy || !svgPath || !pathBounds) {
			console.error('缺少必要数据');
			return;
		}
		setIsLoading(true);
		try {
			const result = await sandboxProxy.insertWarpedSVG({
				d: svgPath,
				bounds: pathBounds,
				originalText: text,
				warpType: 'custom',
				intensity: 1
			});
			if (!result.success) {
				setError(result.error);
			}
		} catch (e) {
			setError(`插入异常: ${e.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const calculatePathBounds = (commands) => {
		let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
		commands.forEach(cmd => {
			if ('x' in cmd && 'y' in cmd) {
				minX = Math.min(minX, cmd.x);
				maxX = Math.max(maxX, cmd.x);
				minY = Math.min(minY, cmd.y);
				maxY = Math.max(maxY, cmd.y);
			}
			if ('x1' in cmd && 'y1' in cmd) {
				minX = Math.min(minX, cmd.x1);
				maxX = Math.max(maxX, cmd.x1);
				minY = Math.min(minY, cmd.y1);
				maxY = Math.max(maxY, cmd.y1);
			}
			if ('x2' in cmd && 'y2' in cmd) {
				minX = Math.min(minX, cmd.x2);
				maxX = Math.max(maxX, cmd.x2);
				minY = Math.min(minY, cmd.y2);
				maxY = Math.max(maxY, cmd.y2);
			}
		});
		return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
	};

	return (
		<div style={styles.container}>
			<label style={styles.label}>Preview</label>
			<div style={styles.content}>
				{selected == "mesh" ? <Mesh
					setPathBounds={setPathBounds}
					text={text}
					setSvgPath={setSvgPath}
					fontUrl={fontUrl}
					lineHeight={lineHeight}
					letterSpacing={letterSpacing}
					alignment={alignment}
					calculatePathBounds={calculatePathBounds}
				/> : <Smudge
					pathBounds={pathBounds}
					setPathBounds={setPathBounds}
					text={text}
					setSvgPath={setSvgPath}
					fontUrl={fontUrl}
					lineHeight={lineHeight}
					letterSpacing={letterSpacing}
					alignment={alignment}
					calculatePathBounds={calculatePathBounds}
				/>}

				<label style={styles.label}>Type</label>
				<div style={styles.shapeContainer}>
					{Shape.map((s) => (
						<button
							key={s}
							onFocus={(e) => e.target.blur()}
							style={{
								...styles.shapeButton,
								...(selected === s ? styles.shapeButtonSelected : {}),
								outline: 'none',
							}
							}
							onClick={() => setSelected(s)}
							onMouseEnter={(e) => {
								if (selected !== s) {
									e.target.style.borderColor = '#007bff';
								}
							}}
							onMouseLeave={(e) => {
								if (selected !== s) {
									e.target.style.borderColor = '#CBE2FF';
								}
							}}
						>
							<img src={`./icon/${s}.svg`} alt={s} />
							{s}
						</button>
					))}
				</div>

				{error && <div style={styles.errorMessage}>{error}</div>}
			</div>

			<div style={styles.buttonGroup}>
				<button
					onClick={handleInsert}
					disabled={isLoading || !svgPath}
					style={isLoading || !svgPath ? styles.insertButtonDisabled : styles.insertButton}
					onMouseEnter={(e) => {
						if (!isLoading && svgPath) {
							e.target.style.transform = 'translateY(-2px)';
							e.target.style.boxShadow = '0 6px 20px rgba(17, 120, 255, 0.4)';
						}
					}}
					onMouseLeave={(e) => {
						if (!isLoading && svgPath) {
							e.target.style.transform = 'translateY(0)';
							e.target.style.boxShadow = '0 4px 15px rgba(17, 120, 255, 0.3)';
						}
					}}
				>
					{isLoading ? 'Inserting...' : 'Add to Design'}
				</button>
			</div>
		</div>
	);
};

export default CustomTextPage; 
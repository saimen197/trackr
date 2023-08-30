function getColorForPercentage(percentage) {
    if (percentage <= 50) {
        const ratio = percentage / 50;
        return interpolateColor('#D32F2F', '#FFA000', ratio);
    } else if (percentage <= 100) {
        const ratio = (percentage - 50) / 50;
        return interpolateColor('#FFA000', '#CDDC39', ratio);
    } else if (percentage <= 150) {
        const ratio = (percentage - 100) / 50;
        return interpolateColor('#CDDC39', '#FFEB3B', ratio);
    } else {
        const ratio = (percentage - 150) / 50;
        return interpolateColor('#FFEB3B', '#B71C1C', ratio);
    }
}

function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);

    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor).toString(16).padStart(2, '0');
    const g = Math.round(g1 + (g2 - g1) * factor).toString(16).padStart(2, '0');
    const b = Math.round(b1 + (b2 - b1) * factor).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}



const NutritionalBar = ({ label, value, max }) => {
    const percentage = (value / max) * 100;
    const color = getColorForPercentage(percentage);

    return (
        <div className="nutritional-bar-container">
            <label>{label}</label>
            <div className="bar">
                <span>{value} / {max}</span>
                <div className="filled" style={{ width: `${Math.min(percentage, 200)}%`, background: color }}></div>
            </div>
            
        </div>
    );
};

export default NutritionalBar;

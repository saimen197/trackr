function getColorForPercentage(percentage) {
    if (percentage <= 50) {
        const ratio = percentage / 50;
        return interpolateColor('#8B0000', '#DAA520', ratio); // Dark Red to Dark Goldenrod
    } else if (percentage <= 100) {
        const ratio = (percentage - 50) / 50;
        return interpolateColor('#DAA520', '#2E8B57', ratio); // Dark Goldenrod to Sea Green
    } else if (percentage <= 150) {
        const ratio = (percentage - 100) / 50;
        return interpolateColor('#2E8B57', '#DAA520', ratio); // Sea Green to Dark Goldenrod
    } else {
        const ratio = (percentage - 150) / 50;
        return interpolateColor('#DAA520', '#641E16', ratio); // Dark Goldenrod to a darker shade of red
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
        <div className="nutritional-bar-container mb-3">
            <label className="d-block mb-1 dark-theme-title">{label}</label>
            <div className="bar position-relative bg-dark rounded">
                <span className="position-absolute w-100 text-center text-light">{Math.round(value)} / {max}</span>
                <div className="filled" style={{ width: `${Math.min(percentage, 200)}%`, background: color }}></div>
            </div>
        </div>
    );
};

export default NutritionalBar;


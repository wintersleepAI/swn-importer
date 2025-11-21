export class Constants {
    /** This module id */
    static MODULE_ID = "swn-importer";
    /** i18n tables prefix */
    static LOCALIZATION_NAMESPACE = "SWN-IMPORTER";

    /** Scene background color */
    static BACKGROUND_COLOR = "#01162c";
    /** Scene grid color */
    static GRID_COLOR = "#99caff";

    /** Hex horizontal radius */
    static HEX_RADIUS = 100;
    
    /** Hex width */
    static HEX_WIDTH = 2 * Constants.HEX_RADIUS;
    /** Hex height */
    static HEX_HEIGHT = 2 * ((-1 * ((Constants.HEX_RADIUS / 2) ** 2 - Constants.HEX_RADIUS ** 2)) ** 0.5);
    /** Hex vertical radius */
    static HEX_VERTICAL_RADIUS = Constants.HEX_HEIGHT / 2;
    
    /** Distance of notes from center of hex */
    static ORBITING_DISTANCE = 0.55 * Constants.HEX_RADIUS;

    /** List of handlebars partials */
    static PARTIALS = ["tag", "notes", "tagLinks", "imagePicker"];
}

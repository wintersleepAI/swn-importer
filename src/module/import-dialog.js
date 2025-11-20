import { Importer } from './importer';
import { Options } from './model/options';
import { Utils } from './utils';

export class ImportDialog extends FormApplication {

    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            popOut: true,
            minimizable: true,
            resizable: true,
            height: 'auto',
            id: 'swn-importer-dialog',
            template: Utils.getTemplatePath("dialog.html"),
            title: Utils.getLabel("DIALOG-TITLE"),
            editable: true
        };

        const mergedOptions = mergeObject(defaults, overrides);

        return mergedOptions;
    }

    constructor(importer) {
        super({});
        this.importer = importer;
    }

    getData() {
        return new Options();
    }

    async _updateObject(event, formData) {
        const url = ImportDialog.getFileUrl();
        if (formData && url) {
            await this.close();
            this.importer.importFile(url, formData);
        }
    }

    static getFileUrl() {
        const input = $('#swn-sector-file')[0];
        if (input && input.files?.length) {
            return URL.createObjectURL(input.files.item(0));
        } else {
            return null;
        }
    }

}

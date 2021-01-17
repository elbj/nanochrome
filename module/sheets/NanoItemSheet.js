export default class NanoItemSheet extends ItemSheet{

    get template(){
        return `systems/nanochrome/templates/sheets/${this.item.data.type}-sheet.html`;
    }

    getData(){
        const data = super.getData();

        data.config = CONFIG.nanochrome;

        console.log(data);

        return data;
    }

    _onDrop(data){
        console.log(data);
    }
}
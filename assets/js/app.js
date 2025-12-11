const hamburguer = document.querySelector('.toggle-btn');
hamburguer.addEventListener('click', () => {
    document.querySelector('#sidebar').classList.toggle('collapsed');
})


//div responsavel pela mensagem de bom dia/tarde/noite na tela
const divWelcome = document.querySelector('.welcomeMessage');

//div responsavel por exibir as informações da lista selecionada na barra a direita
const divtitleList = document.querySelector('#titleList');

//div responsável por escurecer a tela ao abrir um modal.
const overlayDiv = document.querySelector('#overlay');

//div responsável pela lista de tarefas criadas.
// const divlistsview = document.querySelector('#listsview');
const divlistsview = document.querySelector('.sidebar-nav');

//botao de nova tarefa
const newTaskBtn = document.querySelector('#newTask');

//modal nova tarefa
const modalNewTask = document.querySelector('#modalNewTask');
const closeDlgModalNewTask = document.querySelector('#closeModal');
const select_box_display = document.querySelector('#select_box_display');
const formTask = document.querySelector('#frmCreateTask');


//modal editar tarefa
const modalEditTask = document.querySelector('#modalEditTask');
const closeDlgModalEditTask = document.querySelector('#closeModalEditTask');
const select_box_display_edit = document.querySelector('#select_box_display_edit');
const recurring_task_checkbox_edit = document.querySelector('#recurring_task_edit');
const formTaskEdit = document.querySelector('#frmEditTask');


//botao de nova Lista
const newlistBtn = document.querySelector('#btnNewList');

//modal nova lista
const modalNewList = document.querySelector('#modalNewList');
const closeDlgModalNewList = document.querySelector('#closeModalNewList');
const formList = document.querySelector('#frmCreateList');

//botao de editar Lista
const EditlistBtn = document.querySelector('#editList');

//modal editar lista
const modalEditList = document.querySelector('#modalEditNameList');
const closeDlgModalEditList = document.querySelector('#closeModalEditNameList');
const EditformList = document.querySelector('#frmSaveList');


//checkbox Tarefa recorrente
const recur_task_checkbox = document.querySelector('#recurring_task');

//variavel responsável por armazenar o ID da lista clicada
let listClicked = null;

//variavel reponsável por armazenar o ID da tarefa a ser editada
let taskClicked = null;

//div responsavel por exibir as tarefas de acordo com a lista
const div_tasks = document.querySelector('#tasks');
const div_task_controls = document.querySelector('#controls-forms');

//esconde a barra de controles das tarefas até clicar na lista
div_task_controls.style.display = 'none';

//botão responsável por apagar lista
const btnDeleteList = document.querySelector('#deleteList');

//modal de confirmação de apagar lista
const modalDeleteList = document.querySelector('#modalDeleteList');

//fechar a caixa de dialogo de apagar lista
const closeDlgModalDeleteList = document.querySelector('#closeModalDeleteList');

//botões de confirmar/cancelar exclusão da lista
const btnCancelDeleteList = document.querySelector("#cancel_delete_list");
const btnConfirmDeleteList = document.querySelector('#confirm_delete_list');


//modal de confirmação de apagar tarefa
const modalDeleteTask = document.querySelector('#modalDeleteTask');

//fechar a caixa de dialogo de apagar tarefa
const closeDlgModalDeleteTask = document.querySelector('#closeModalDeleteTask');

//botões de confirmar/cancelar exclusão da tarefa
const btnCancelDeleteTask = document.querySelector("#cancel_delete_task");
const btnConfirmDeleteTask = document.querySelector('#confirm_delete_task');



//div padrão exibida ao abrir o aplicativo
const divDefaultDsply = document.querySelector('#defaultDisplay');

//banco de dados das tarefas e listas
const db = new Dexie('TodoList');

// tabela das tarefas
db.version(1).stores({
    tasks: `id,title,description,priority,dueDate,dueTime,completed,createdAt,isRecurring,recurrenceType,listid`
});

//tabela das listas
db.version(2).stores({
    lists: `id,name,createdAt`
});




//função que cria um ID unico aleatório
const generateUUID=()=> {
    const uniqueid = crypto.randomUUID();
    return uniqueid;
}

// função que aciona a abertura do modal na tela
const openModal=(idmodal)=>{
    idmodal.style.display = 'block';
    overlayDiv.style.display = 'block';
}

//função que fecha o modal na tela
const closeModal=(idmodal)=>{
    idmodal.style.display = 'none';
    overlayDiv.style.display = 'none';
}

//Pegar dados de uma Lista pelo ID
const getListInfo = async (listid) => {

    const lista = await db.lists.where('id').equals(listid).toArray();

    return lista;
   
}

//Pega dados de uma tarefa pelo ID
const getTaskInfo = async (taskid) => {

    const tarefa = await db.tasks.where('id').equals(taskid).toArray();

    return tarefa;

}

//pega o total de tarefas em uma determinada lista pelo ID
const getTaskCount = async (listid) => {

    const contagem = await db.tasks.where('listid').equals(listid).count();

    return contagem;
   
}

//função que permite que somente um item da lista exiba como selecionado
const tirarSelecao=()=> {
    const tdSelecionados = [...document.querySelectorAll('.active')];
    tdSelecionados.forEach(el => el.classList.remove('active'))
}

const updateRecurrences = async (taskid, data, type_recurring) => {

    let data_convert = new Date(`${data}`);
    let new_date = '';


    if(type_recurring === "diary") {
        data_convert = data_convert.setDate(data_convert.getDate()+1);
        new_date = new Date(data_convert).toISOString().split('T')[0];
    }else if(type_recurring === "weekly") {
        data_convert = data_convert.setDate(data_convert.getDate()+7);
        new_date = new Date(data_convert).toISOString().split('T')[0];
    } else if(type_recurring === "monthly") {
        data_convert = data_convert.setMonth(data_convert.getMonth()+1);
        new_date = new Date(data_convert).toISOString().split('T')[0];
    } else {
        data_convert = data_convert.setFullYear(data_convert.getFullYear()+1);
        new_date = new Date(data_convert).toISOString().split('T')[0];
    }


    const updateRecurringTask = await db.tasks.where('id').equals(taskid).modify(item => {
        item.dueDate = new_date;
        item.completed = false;
    }).then(() => {
        console.log('Data atualizada com sucesso!');
    }).catch((error) => {
        console.error('Ocorreu um erro ao atualizar a data: '+error);
    });

}

// função que verifica se a tarefa é recorrente para atualizar a data
const checkRecurrences = async () => {

    const check_recurrences = await db.tasks.toArray();

    const todayStr = new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo"
    });

    //const today = new Date(todayStr).getTime();

    for(const item of check_recurrences) {

        const dueStr = new Date(item.dueDate).toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo"
        });

        //const due = new Date(dueStr).getTime();

        if(item.isRecurring === true && item.completed === true && todayStr >= dueStr){
            await updateRecurrences(item.id, item.dueDate, item.recurrenceType);
        }

    }

}


//função que exibe a listas de tarefas
const ViewLists = async () => {

    divlistsview.innerHTML = '';

    // divlistsview.innerHTML = '';

    const allList = await db.lists.toArray()

    .then((list)=>{
        list.forEach(item => {

            const navList = document.createElement('li');
            navList.setAttribute('listid',`${item.id}`);
            navList.setAttribute('class','sidebar-item');

            navList.onclick = () => {
                listClicked = item.id;
                tirarSelecao();
                navList.classList.add('active');
                div_task_controls.style.display = 'flex';
                divtitleList.style.display = 'block';
                divDefaultDsply.style.display = 'none';
                viewTasks(item.id);
            }

            const alink = document.createElement('a');
            alink.setAttribute('class','sidebar-link');
            alink.setAttribute('href','#');

            const spanNameList = document.createElement('span');
            spanNameList.setAttribute('class','link');
            spanNameList.innerHTML = `<i class="lar la-list-alt"></i> ${item.name}`;

            alink.appendChild(spanNameList);

            navList.appendChild(alink);

            divlistsview.appendChild(navList);

            
    

        })
    }).catch((error)=>{
        console.error('Ocorreu um erro: '+error);
    });


}


//função assincrona que apaga a lista completa
const deleteList = async (listid) => {

    const check_tasks_delete_list = await db.tasks.where('listid').equals(listid).delete()
    .then(() => {
        console.log('tarefas da lista apagada!');
    }).catch((error => {
        console.error('Ocorreu um erro ao apagar as tarefas da lista: '+error);
    }))

    const check_list_delete = await db.lists.where('id').equals(listid).delete()
    .then(() => {

        console.log('Lista apagada com sucesso!');
    }).catch((error => {
        console.error('Ocorreu um erro ao apagar a lista! Erro: '+error);
    }))

}

const deleteTask = async (taskid) => {

    const check_task_delete = await db.tasks.where('id').equals(taskid).delete()
    .then(() => {
        console.log('Tarefa apagada com sucesso!');
    }).catch((error => {
        console.error('Ocorreu um erro ao apagar a tarefa! Erro: '+error);
    }))

}


//função responsavel por verificar se a tarefa foi completada
const marked = async (taskid) => {

    const dataupdate = await db.tasks.where('id').equals(taskid).modify(task => {
        task.completed = !task.completed;
    }).then(() => {
        return true;
    }).catch((error => {
        console.error('Ocorreu um erro: '+error);
        return false;
    }));

}

const updateTask = async (task_update_data, taskid) => {

    const title_task = task_update_data.title;
    const description_task = task_update_data.description;
    const priority_task = task_update_data.priority;
    const isRecurring_task = task_update_data.isRecurring;
    const recurrenceType_task = task_update_data.recurrenceType;
    const dueDate_task = task_update_data.dueDate;
    const dueTime_task = task_update_data.dueTime;
    
    const update = await db.tasks.where('id').equals(taskid).modify(task => {
        task.title = title_task;
        task.description = description_task;
        task.priority = priority_task;
        task.isRecurring = isRecurring_task;
        task.recurrenceType = recurrenceType_task;
        task.dueDate = dueDate_task;
        task.dueTime = dueTime_task;
    }).then(() => {
        console.log('Tarefa alterada com sucesso!');
        taskClicked = null;
        viewTasks(listClicked);
    }).catch((error => {
        console.error('Ocorreu um erro ao alterar a tarefa: '+error);
    }))

}

//função assincrona de exibição das tarefas pelo id da lista na tela
const viewTasks = async (listid) => {

    const List_tname = document.querySelector('#List_tname');
    const data_criacao = document.querySelector('.createdDate');

    div_tasks.innerHTML = '';

    list_Object = await getListInfo(listid);
    
    List_tname.textContent = list_Object[0].name;

    let date_createdISO = new Date(list_Object[0].createdAt);

    data_criacao.textContent = `Lista criada ${date_createdISO.toLocaleDateString('pt-BR', { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;

    const allTasks = await db.tasks.where('listid').equals(listid).reverse().sortBy('createdAt')
    .then((task)=> {
        task.forEach(item => {
            
            const div_task = document.createElement('div');
            div_task.setAttribute('class','task');

            const spanNomeTask = document.createElement('span');
            spanNomeTask.id = 'nameTask';
            spanNomeTask.textContent = `${item.title}`;



            if(item.completed === true){
                div_task.classList.add('marked');
            }

            spanNomeTask.onclick = () => {
                if(marked(item.id)){
                    div_task.classList.toggle('marked');
                    viewTasks(listid);
                }
            }

            let text_priority = '';

            if(item.priority === 'high'){
                text_priority = 'Alta';
            }else if(item.priority === 'medium') {
                text_priority = 'Média';
            } else {
                text_priority = 'Baixa'; 
            }

            let actual_date = new Date();

            let compare_date_actual = new Date().toISOString().split('T')[0];

            actual_date = actual_date.toLocaleDateString('pt-BR');

            let date_task = new Date(`${item.dueDate}T12:00:00Z`);
            date_task = date_task.toLocaleDateString('pt-BR');



            const dateTask = item.dueDate;

            const [ano, mes, dia] = dateTask.split('-').map(v => parseInt(v));

            const newDate = `${dia}/${mes}/${ano}`;


            const div_task_info = document.createElement('div');
            div_task_info.id = 'taskinfo';
            div_task_info.innerHTML = `<span class="listOrigin">
                            ${(item.dueDate ? `<span class="periodTask"><i class="lar la-calendar-check"></i> ${newDate}</span>` : '')} 
                        <span class="priorityTask ${item.priority}">${text_priority}</span>`;

            if(item.dueDate < compare_date_actual && item.completed === false && item.dueDate !== '') {
                div_task_info.innerHTML += `<span class="late-task">
	<i class="las la-exclamation-triangle"></i>
                            Atrasada</span>`;
            }

            // if(item.isRecurring === true && item.completed === true && compare_date_actual > item.dueDate){
                
            // }


            if(item.isRecurring){

                if(item.recurrenceType === "diary") {
                    div_task_info.innerHTML += `<span class="recurringTask">&#x21BB; Diaria</span>`;
                }else if(item.recurrenceType === "weekly") {
                    div_task_info.innerHTML += `<span class="recurringTask">&#x21BB; Semanal</span>`;
                } else if(item.recurrenceType === "monthly") {
                    div_task_info.innerHTML += `<span class="recurringTask">&#x21BB; Mensal</span>`;
                } else {
                    div_task_info.innerHTML += `<span class="recurringTask">&#x21BB; Anual</span>`;
                }

            }
            

            const btnDeleteTask = document.createElement('button');
            btnDeleteTask.id = 'btnDeleteTask';
            btnDeleteTask.setAttribute('taskid', item.id);
            btnDeleteTask.setAttribute('title','Apagar Tarefa');
            btnDeleteTask.innerHTML = `<i class="lar la-trash-alt"></i>`;

            const btnEditTask = document.createElement('button');
            btnEditTask.id = 'btnEditTask';
            btnEditTask.setAttribute('taskid', item.id);
            btnEditTask.setAttribute('title','Editar Tarefa');
            btnEditTask.innerHTML = `<i class="las la-pen"></i>`;

            //evento de apagar tarefa 
            btnDeleteTask.addEventListener('click', async () => {
                openModal(modalDeleteTask);
                taskClicked = item.id;
            });


            //evento de editar tarefa
            btnEditTask.addEventListener('click', async () => {
                openModal(modalEditTask);
                taskClicked = item.id;
                task_Object = await getTaskInfo(item.id);

                const name_task_frm = document.querySelector('#title_task_edit');
                const descr_task_frm = document.querySelector('#description_task_edit');
                const priority_task_frm = document.querySelector('#priority_edit');
                const date_priority_task_frm = document.querySelector('#date_period_task_edit');
                const time_priority_task_frm = document.querySelector('#time_period_task_edit');
                const recurring_task_frm = document.querySelector('#recurring_task_edit');
                const select_box_display_edit_frm = document.querySelector('#select_box_display_edit');
                const select_box_type_recurring_edit = document.querySelector('#type_recurring_edit');

                //select_box_type_recurring_edit

                name_task_frm.value = `${task_Object[0].title}`;
                descr_task_frm.value = `${task_Object[0].description}`;
                priority_task_frm.value = `${task_Object[0].priority}`;
                date_priority_task_frm.value = `${task_Object[0].dueDate}`;
                time_priority_task_frm.value = `${task_Object[0].dueTime}`;

                const values = { low: 'Baixa', medium: 'Média', high: 'Alta' };

                const type_recur = { diary: 'Diaria', weekly: 'Semanal', monthly: 'Mensal', annually: 'Anual' };

                priority_task_frm.innerHTML = '';
                select_box_type_recurring_edit.innerHTML = '';

                for(const chave in values) {
                    const select_opt_priority = document.createElement('option');
                    select_opt_priority.value = chave;

                    if(task_Object[0].priority === chave) {
                        select_opt_priority.setAttribute('selected','selected');
                    }

                    select_opt_priority.textContent = values[chave];
                    priority_task_frm.appendChild(select_opt_priority);
                }

                if(task_Object[0].isRecurring){
                    recurring_task_frm.checked = true;
                    select_box_display_edit_frm.style.display = 'flex';
                }else{
                    recurring_task_frm.checked = false;
                    select_box_display_edit_frm.style.display = 'none';
                }

                for(const chave in type_recur) {
                    const select_opt_priority = document.createElement('option');
                    select_opt_priority.value = chave;

                    if(task_Object[0].recurrenceType === chave) {
                        select_opt_priority.setAttribute('selected','selected');
                    }

                    select_opt_priority.textContent = type_recur[chave];
                    select_box_type_recurring_edit.appendChild(select_opt_priority);
                }


            });

            div_task_info.appendChild(btnDeleteTask);
            div_task_info.appendChild(btnEditTask);

            div_task.appendChild(spanNomeTask);
            div_task.appendChild(div_task_info);
            div_tasks.appendChild(div_task);

        })
    })

}



// função que cria a tarefa no DB
const addTask = async (taskdata)=>{

    //const uniqueid = generateUUID();
    const title = taskdata.title;
    const description = taskdata.description;
    const priority = taskdata.priority;
    const createdAt = taskdata.createdAt;
    const isRecurring = taskdata.isRecurring;
    const recurrenceType = taskdata.recurrenceType;
    const listID = taskdata.listID;
    const dueDate = taskdata.dueDate;
    const dueTime = taskdata.dueTime;

    await db.tasks.add({
        id:generateUUID(),
        title:title,
        description:description,
        priority: priority,
        createdAt: createdAt,
        isRecurring: isRecurring,
        recurrenceType: recurrenceType,
        completed: false,
        listid: listID,
        dueDate: dueDate,
        dueTime: dueTime
    }).then(()=> {
        console.log('Tarefa cadastrada com sucesso!');
        viewTasks(listClicked);
    }).catch((error) => {
        console.error('Ocorreu um erro ao criar a Tarefa: '+ error);
    });

}


const addList = async (listdata) => {

    const title_list = listdata.title_list;
    const createdAt_list = listdata.createdAt_list;

    await db.lists.add({
        id: generateUUID(),
        name: title_list,
        createdAt: createdAt_list
    }).then(()=> {
        console.log('lista criada com sucesso!');
        ViewLists();
    }).catch((error) => {
        console.error('Ocorreu um erro ao criar a lista: '+ error);
    });

}

// contém os eventos dos botões da pagina
const botoesEventos=()=> {

    // //evento de exibir/esconder barra lateral mobile
    // btnHideViewMobile.addEventListener('click', ()=> {
    //     divMenu.classList.toggle('hide');
    //     hideBar.style.display = 'flex';
    //     btnHideViewMobile.style.display = 'none';
    // });

    // btnHideViewMobile.style.display = 'none';

    // // //evento de exibir/esconder barra lateral
    // btnHideView.addEventListener('click', ()=> {
    //     divMenu.classList.toggle('hide');
    //     hideBar.style.display = 'none';
    //     btnHideViewMobile.style.display = 'block';
    // });

    //evento de criar nova tarefa
    newTaskBtn.addEventListener('click', () => {
        openModal(modalNewTask);
    });


    //botão de criar nova lista
    newlistBtn.addEventListener('click', () => {
        openModal(modalNewList);
    });

    //botão de abertura do modal de edição da lista
    EditlistBtn.addEventListener('click', async () => {
        openModal(modalEditList);
        list_Object = await getListInfo(listClicked);
        let name_list_frm = document.querySelector('#name_list_edit');
        name_list_frm.value = `${list_Object[0].name}`;
    });

    //botão de fechamento do modal de nova tarefa
    closeDlgModalNewTask.addEventListener('click', () => {
        closeModal(modalNewTask);
    });

    //botão de fechamento do modal de editar tarefa
    closeDlgModalEditTask.addEventListener('click', () => {
        closeModal(modalEditTask);
        taskClicked = null;
    });

    //botão de fechamento do modal de criação de nova lista
    closeDlgModalNewList.addEventListener('click', () => {
        closeModal(modalNewList);
    });

    //botão de fechamento do modal de edição da lista
    closeDlgModalEditList.addEventListener('click', () => {
        closeModal(modalEditList);
    });

    //evento que exibe/esconde div de tarefa recorrente do modal criar tarefa
    recur_task_checkbox.addEventListener('change', (evt) => {
        if(evt.target.checked) {
            select_box_display.style.display = 'flex';
        }else{
            select_box_display.style.display = 'none';
        }
    });

    //evento que exibe/esconde div de tarefa recorrente do modal editar tarefa
    recurring_task_checkbox_edit.addEventListener('change', (evt) => {
        if(evt.target.checked) {
            select_box_display_edit.style.display = 'flex';
        }else{
            select_box_display_edit.style.display = 'none';
        }
    });

    //botão de abertura do modal de confirmação de apagar lista
    btnDeleteList.addEventListener('click', async () => {
        openModal(modalDeleteList);
        list_Object = await getListInfo(listClicked);
        let message_delete_list = document.querySelector('#message_delete_list');
        message_delete_list.textContent = `Você tem certeza que deseja apagar a lista ${list_Object[0].name}?`;
    });

    //botão de fechamento do modal de confirmação de apagar tarefa
    closeDlgModalDeleteTask.addEventListener('click', () => {
        closeModal(modalDeleteTask);
        taskClicked = null;
    });

    //botão de fechamento do modal de confirmação de apagar lista
    closeDlgModalDeleteList.addEventListener('click', () => {
        closeModal(modalDeleteList);
    });

    btnCancelDeleteList.addEventListener('click', () => {
        closeModal(modalDeleteList);
    });

    btnConfirmDeleteList.addEventListener('click', async () => {
        await deleteList(listClicked);
        closeModal(modalDeleteList);
        div_task_controls.style.display = 'none';
        divtitleList.style.display = 'none';
        divDefaultDsply.style.display = 'block';
        ViewLists();
    });

    btnCancelDeleteTask.addEventListener('click', () => {
        closeModal(modalDeleteTask);
    });

    btnConfirmDeleteTask.addEventListener('click', async () => {
        await deleteTask(taskClicked);
        closeModal(modalDeleteTask);
        viewTasks(listClicked);
        taskClicked = null;
    });

}


// Função que retorna na tela em qual fase do dia ou noite o usuário está.
const printMessageDayNight=()=> {

    const dataAtual = new Date();
    const hora = dataAtual.getHours();

    if(hora >= 0 && hora < 12) {
        divWelcome.innerHTML = '<span class="daynighticon">☀️</span> Bom Dia!';
    }else if(hora >= 12 && hora <= 18){
        divWelcome.innerHTML = '<span class="daynighticon">☀️</span> Boa Tarde!';
    }else{
        divWelcome.innerHTML = '<span class="daynighticon">🌙</span> Boa Noite!';
    }

}

//função reponsavel por alterar os dados da lista
const updateList = async (listClicked, data) => {

    const updateList = await db.lists.where('id').equals(listClicked).modify(list => {
        list.name = data.name;
    }).then(() => {
        console.log('Lista alterada com sucesso!');
    }).catch((error => {
        console.error('Ocorreu um erro: '+error);
    }));

}

formTaskEdit.onsubmit = async (evt) => {

    evt.preventDefault();

    const formData = new FormData(formTaskEdit);
    const formObject = Object.fromEntries(formData.entries());

    let TaskEditObj = {
        title: formObject.title_task_edit,
        description: formObject.description_task,
        priority: formObject.priority_edit,
        isRecurring: (formObject.recurring_task_edit ? true : false),
        recurrenceType: (formObject.type_recurring_edit ? formObject.type_recurring_edit : false),
        dueDate: (formObject.date_period_task_edit ? formObject.date_period_task_edit : ""),
        dueTime: (formObject.time_period_task_edit ? formObject.time_period_task_edit : ""),
        listid: listClicked,

    };

    await updateTask(TaskEditObj, taskClicked);

    formTaskEdit.reset();

    closeModal(modalEditTask);

}

formTask.onsubmit = async (evt) => {

    evt.preventDefault();

    const formData = new FormData(formTask);
    const formObject = Object.fromEntries(formData.entries());

    const dataObj = new Date();

    let dataTask = { 
        title: formObject.title_task,
        description: formObject.description_task,
        dueDate: formObject.date_period_task,
        dueTime: formObject.time_period_task,
        createdAt: dataObj.toISOString(),
        priority: formObject.priority,
        isRecurring: (formObject.recurring_task ? true : false),
        recurrenceType: (formObject.recurring_task ? formObject.type_recurring : false),
        listID: (listClicked ? listClicked : null),
        dueDate: (formObject.date_period_task ? formObject.date_period_task : ""),
        dueTime: (formObject.time_period_task ? formObject.time_period_task : "")
    };

    await addTask(dataTask);

    formTask.reset();

    closeModal(modalNewTask);

}

formList.onsubmit = async (evt) => {
    
    evt.preventDefault();

    const formData = new FormData(formList);
    const formObject = Object.fromEntries(formData.entries());

    const dataObj = new Date();

    let dataList = {
        title_list: formObject.name_list,
        createdAt_list: dataObj.toISOString()
    }

    await addList(dataList);

    formList.reset();

    closeModal(modalNewList);

}

EditformList.onsubmit = async (evt) => {

    evt.preventDefault();

    const formData = new FormData(EditformList);
    const formObject = Object.fromEntries(formData.entries());

    let List = {
        name: formObject.name_list_edit
    }

    await updateList(listClicked, List);

    ViewLists();
    viewTasks(listClicked);

    closeModal(modalEditList);

}

ViewLists();

botoesEventos();
printMessageDayNight();
checkRecurrences();
import { chat, eventSource, event_types, extractMessageBias, messageFormatting, saveChatConditional } from '../../../../script.js';
import { getMessageTimeStamp } from '../../../RossAscends-mods.js';

const addDom = (mesDom)=>{
    const getMes = ()=>chat[mesDom.getAttribute('mesid')];
    if (mesDom.querySelector('.stus--btn')) return;
    let counter;
    const updateCounter = ()=>counter.textContent = `${(getMes().swipe_id ?? 0) + 1}/${getMes().swipes?.length ?? 1}`;
    const btnLeft = document.createElement('div'); {
        btnLeft.classList.add('stus--btn');
        btnLeft.classList.add('swipe_left');
        btnLeft.classList.add('fa-solid');
        btnLeft.classList.add('fa-chevron-left');
        btnLeft.addEventListener('click', (evt)=>{
            evt.stopPropagation();
            const mes = getMes();
            if (mes.swipe_id === null || mes.swipe_id === undefined) {
                mes.swipe_id = 1;
            }
            if (mes.swipe_id > 0) {
                mes.swipe_id--;
                mes.mes = mes.swipes[mes.swipe_id];
                mesDom.querySelector('.mes_text').innerHTML = messageFormatting(
                    mes.mes,
                    mes.name,
                    mes.is_system,
                    mes.is_user,
                    Number(mesDom.getAttribute('mesid')),
                );
                updateCounter();
                saveChatConditional();
            }
        });
        const mo = new MutationObserver(muts=>{
            btnLeft.style.display = '';
            updateCounter();
        });
        mo.observe(btnLeft, { attributeFilter:['style'], attributes:true });
        mesDom.querySelector('.swipe_left').insertAdjacentElement('beforebegin', btnLeft);
    }
    const btnRight = document.createElement('div'); {
        btnRight.classList.add('stus--btn');
        btnRight.classList.add('swipe_right');
        btnRight.classList.add('fa-solid');
        btnRight.classList.add('fa-chevron-right');
        btnRight.addEventListener('click', (evt)=>{
            evt.stopPropagation();
            const mes = getMes();
            let requestInput = false;
            if (mes.swipe_id === null || mes.swipe_id === undefined) {
                mes.swipe_id = 0;
            }
            if (!mes.swipes) {
                mes.swipes = [mes.mes];
            }
            if (!mes.swipe_info) {
                mes.swipe_info = [{
                    send_date: mes.send_date,
                    gen_started: mes.gen_started,
                    gen_finished: mes.gen_finished,
                    extra: JSON.parse(JSON.stringify(mes.extra)),
                }];
            }
            if (mes.swipe_id + 1 >= mes.swipes.length) {
                requestInput = true;
                mes.swipes.push(mes.mes);
                mes.swipe_info.push({
                    send_date: getMessageTimeStamp(),
                    gen_started: null,
                    gen_finished: null,
                    extra: {
                        bias: extractMessageBias(''),
                        gen_id: Date.now(),
                        api: 'manual',
                        model: 'manual swipe',
                    },
                });
            }
            mes.swipe_id++;
            mes.mes = mes.swipes[mes.swipe_id];
            mesDom.querySelector('.mes_text').innerHTML = messageFormatting(
                mes.mes,
                mes.name,
                mes.is_system,
                mes.is_user,
                Number(mesDom.getAttribute('mesid')),
            );
            updateCounter();
            if (requestInput) {
                mesDom.querySelector('.mes_edit').click();
            } else {
                saveChatConditional();
            }
        });
        const mo = new MutationObserver(muts=>{
            btnRight.style.display = '';
            updateCounter();
        });
        mo.observe(btnRight, { attributeFilter:['style'], attributes:true });
        counter = document.createElement('div'); {
            counter.classList.add('stus--counter');
            counter.classList.add('swipes-counter');
            updateCounter();
            const mo = new MutationObserver(muts=>updateCounter());
            mo.observe(counter, { childList:true });
            btnRight.append(counter);
        }
        mesDom.querySelector('.swipe_right').insertAdjacentElement('beforebegin', btnRight);
    }
};

const initChat = ()=>{
    const mesList = Array.from(document.querySelectorAll('#chat .mes'));
    for (const mes of mesList) {
        addDom(mes);
    }
};

const init = ()=>{
    eventSource.on(event_types.CHAT_CHANGED, ()=>initChat());
    eventSource.on(event_types.USER_MESSAGE_RENDERED, (mesId)=>addDom(document.querySelector(`#chat .mes[mesid="${mesId}"]`)));
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, (mesId)=>addDom(document.querySelector(`#chat .mes[mesid="${mesId}"]`)));
};
init();

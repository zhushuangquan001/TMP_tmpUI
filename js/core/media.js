class media {

    parent = null
    allow_ext = ['mp4', 'm4v', 'rm', 'rmvb', 'webm', 'mkv', 'avi', 'ts', 'm2ts']

    init(parent) {
        this.parent = parent;
    }

    is_allow(ext) {
        return this.allow_ext.indexOf(ext) > -1;
    }

    is_video_ok(id,sha1) {
        setTimeout(() => {
            $.post(this.parent.api_media, {
                action: 'is_video_ok',
                token: this.parent.api_token,
                id: id
            }, (rsp) => {
                if (rsp.status == 1) {
                    $(`.video_ok_${id}`).removeAttr('style');
                    $(`.video_processing_${id}`).attr('style', 'display: none !important;');
                    $(`#video_img_ok_${id}`).attr('preload-src', `https://getfile.tmp.link/media_img-${sha1}-360x220.jpg`);
                    this.parent.lazyload('.lazyload');
                } else {
                    this.is_video_ok(id,sha1);
                }
            }, 'json');
        }, 5000);
    }

    is_video_ok_check(data) {
        //prepare file is ok
        for (let i in data) {
            if (data[i].status !== 'ok') {
                $(`.video_ok_${data[i].id}`).attr('style', 'display: none !important;');
                this.is_video_ok(data[i].id,data[i].sha1);
            } else {
                $(`.video_processing_${data[i].id}`).attr('style', 'display: none !important;');
                $(`#video_img_ok_${data[i].id}`).attr('preload-src', `https://getfile.tmp.link/media_img-${data[i].sha1}-360x220.jpg`);
            }
        }
        this.parent.lazyload('.lazyload');
    }

    video_add(ukey) {
        this.parent.recaptcha_do('video_add', (captcha) => {
            $.post(this.parent.api_media, {
                action: 'video_add',
                captcha: captcha,
                token: this.parent.api_token,
                ukey: ukey
            }, (rsp) => {
                if (rsp.status == 1) {
                    alert(this.parent.languageData.status_ok);
                }
                if (rsp.status == 2) {
                    alert(this.parent.languageData.status_media_not_found);
                }
                if (rsp.status == 3) {
                    alert(this.parent.languageData.status_media_not_allow);
                }
                if (rsp.status == 4) {
                    alert(this.parent.languageData.status_media_added);
                }
                if (rsp.status == 5) {
                    alert(this.parent.languageData.status_media_resolution);
                }
                if (rsp.status == 6) {
                    alert(this.parent.languageData.status_media_duration);
                }
                if (rsp.status == 7) {
                    alert(this.parent.languageData.status_media_usage);
                }
            });
        });
    }

    video_list() {
        $.post(this.parent.api_media, {
            action: 'video_list',
            token: this.parent.api_token
        }, (rsp) => {
            if (rsp.status == 1) {
                //处理界面
                let html = app.tpl('vedio_list_tpl', rsp.data);
                $('#vedio_list').html(html);
                this.is_video_ok_check(rsp.data);
            }
        });
    }

    video_play(id) {
        this.parent.recaptcha_do('video_play', (captcha) => {
            $.post(this.parent.api_media, {
                action: 'video_play',
                token: this.parent.api_token,
                captcha: captcha,
                id: id
            }, (rsp) => {
                if (rsp.status == 1) {
                    //处理界面
                    $('#video_preview_online_src').attr('src', rsp.data);
                    //将页面滚动到最上层
                    $('html,body').animate({ scrollTop: 0 }, 1000);
                    //取消静音
                    $('#video_preview_online_src').prop('muted', false);
                    //视频就绪时自动播放
                    $('#video_preview_online_src').on('canplay', function () {
                        $('#video_preview_online_src').get(0).play();
                    });
                }
            });
        });
    }

    video_del(id) {
        if (this.parent.profile_confirm_delete_get()) {
            if (!confirm(this.parent.languageData.confirm_delete)) {
                return false;
            }
        }
        this.parent.recaptcha_do('video_del', (captcha) => {
            $.post(this.parent.api_media, {
                action: 'video_del',
                captcha: captcha,
                token: this.parent.api_token,
                id: id
            }, () => {
                $('.video_unit_'+id).remove();
            });
        });
    }

    video_rename(id, name) {
        var newname = prompt(this.parent.languageData.modal_meetingroom_newname, name);
        $.post(this.parent.api_media, {
            action: 'video_rename',
            token: this.parent.api_token,
            name: newname,
            id: id
        }, () => {
            //rename dom
            $('.video_unit_title_'+id).text(newname);
        });
    }
}
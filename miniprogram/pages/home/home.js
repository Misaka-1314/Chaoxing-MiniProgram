import config from '@utils/config';
import util from '@utils/util';
import API from '@utils/api';
import log from '@utils/log';

let api = null;

Page({
	data: {
		tab: 'login', // login / courses / activities / signin
		typeDefine: ["拍照签到", "普通签到", "二维码签到", "手势签到", "位置签到", "签到码签到"],
		swiperList: (config.swiperList || [
			"/swiper/1.png",
			"/swiper/2.png",
			"/swiper/3.png",
			"/swiper/4.png",
		]).map(item => `https://testingcf.jsdelivr.net/gh/${config.repository}@main/resource${item}`),
		repository: config.repository,
	},

	onLoad(options) {
		this.setData({
			'username': util.getStorage('username'),
			'password': util.getStorage('password'),
		}, () => {
			this.setData(Object.assign(this.data, options))
		})
	},

	onUnload() {
		util.setStorage('username', this.data.username);
		util.setStorage('password', this.data.password);
	},

	input(e) { // 输入绑定
		this.setData({
			[e.currentTarget.dataset.input]: e.detail.value.trim(),
		})
	},

	login() { // 账号登录
		const username = this.data.username;
		const password = this.data.password;
		if (!username || !password) {
			util.showInfo("帐号或密码不能为空!")
			return;
		}
		api = new API(username, password);
		api.login()
			.then(res => {
				util.showInfo(res.mes);
				if (res.status) {
					api.getUserInfo()
						.then(userinfo => {
							util.showInfo("登录成功")
							this.setData({
								'userinfo': userinfo,
								'tab': 'courses',
							})
							this.options.username = username;
							this.options.password = password;
							this.onUnload(); // 缓存
							this.get_courses(); // 获取课程
						})
				}
			})
			.catch(e => {
				util.showInfo("网络不稳定 请稍后再试");
				log.error("登录失败", e)
			})
	},

	get_courses() { // 获取课程列表
		api.getCourse()
			.then(courses => {
				this.setData({
					'courses': courses,
				})
				util.showInfo("获取课程成功")
			})
			.catch(e => {
				util.showInfo("获取课程失败，请重试")
				log.error("获取课程失败", e)
			})
	},

	get_activities(e) { // 获取签到列表
		const item = e.currentTarget.dataset.item;
		api.getActivity(item.courseId, item.classId)
			.then(activities => {
				this.setData({
					'activities': activities.slice(0, 20),
					'tab': 'activities',
				})
				util.showInfo("获取活动成功");
			})
			.catch(e => {
				util.showInfo("获取活动失败，请重试")
				log.error("获取活动失败", e)
			})
	},

	async to_signin(e) { // 进入签到页
		const item = e.currentTarget.dataset.item;
		this.getUserLocation()
		api = new API(this.data.username, this.data.password);
		api.beforeSign(item.activeId, item.courseId, item.classId);
		this.data.hasValidate = await api.hasValidate(item.activeId); // 是否有滑块验证码
		this.data.token = ([0, 1].includes(item.type)) ? await api.getToken() : ''; // 超星云盘token
		api.getActivityInfo(item.activeId) // 获取签到活动信息
			.then(info => this.setData({
				'info': Object.assign(info, item),
				'info.type': info.otherId || (1 - info.ifphoto), // 是否为拍照签到
				'tab': 'signin',
			}))
	},

	getUserLocation() { // 获取用户位置
		wx.getLocation({
			'type': 'gcj02',
		})
			.then(gcj02 => {
				log.info("获取用户位置", gcj02)
				API.allToBaidu(gcj02.longitude, gcj02.latitude)
					.then(bd09ll => this.setData({
						'location.longitude': bd09ll.x,
						'location.latitude': bd09ll.y,
					}))
				API.getAddressText(gcj02.longitude, gcj02.latitude)
					.then(text => this.setData({
						'location.name': text,
					}))
			})
			.catch(e => {
				util.showInfo("用户拒绝定位")
				log.debug("用户拒绝定位", e)
			})
	},

	chooseLocation() { // 选择位置
		wx.chooseLocation(this.data.location) // 国测局坐标系 gcj02
			.then(gcj02 => {
				log.info("用户选择位置", gcj02)
				API.allToBaidu(gcj02.longitude, gcj02.latitude)
					.then(bd09ll => this.setData({
						'location.latitude': bd09ll.y,
						'location.longitude': bd09ll.x,
						'location.name': gcj02.name || gcj02.address,
					}))
			})
			.catch(e => {
				util.showInfo("取消位置选择")
				log.debug("取消位置选择", e)
			})
	},

	async signin(e) { // 提交签到
		const objectId = (this.data.srcList || []).length ? this.data.srcList[0] : "";
		const location = this.data.location;
		const info = this.data.info;
		const userinfo = this.data.userinfo;

		let res = "";
		if (this.data.hasValidate)
			this.data.validate = ""; // 课后作业：此处请自行实现 GET请求 https://cx.micono.eu.org/api/validate

		if (info.type == 0 || info.type == 1) { // 图片/普通
			if (objectId == 0 && info.type == 0) {
				const ok = await wx.showModal({
					title: '确认直接签到吗?',
					content: '你还没有上传图片',
				})
				if (ok.confirm != true)
					return;
			}
			res = await api.defaultSign(info.activeId, objectId, null, null, null, null, null, null, userinfo.name, this.data.validate);
		}

		if (info.type == 3 || info.type == 5) { // 签到码/手势
			res = await api.defaultSign(info.activeId, null, null, null, null, this.data.signCode, null, null, userinfo.name, this.data.validate);
		}

		if (info.type == 4) { // 位置
			res = await api.defaultSign(info.activeId, null, location.longitude, location.latitude, location.name, null, null, null, userinfo.name, this.data.validate);
		}

		if (info.type == 2) { // 二维码
			const qrcode = await wx.scanCode();
			log.debug("扫码结果", qrcode)
			let params = {};
			qrcode.result.split('?')[1].split('&').forEach(param => {
				const parts = param.split('=');
				const key = decodeURIComponent(parts[0]);
				const value = decodeURIComponent(parts[1]);
				params[key] = value;
			});
			const enc = params.enc;
			res = await this.data.api.defaultSign(info.activeId, null, location.longitude, location.latitude, location.name, null, null, enc, userinfo.name, this.data.validate);
		}

		const msg = API.getResult(res);
		util.showInfo(msg, 'none', true);
		this.setData({
			'result': msg,
		})
	},

	handleAdd(e) { // 上传图片
		const files = e.detail.files;
		const token = this.data.token;
		const fileList = this.data.fileList || [];
		files.forEach(file => {
			this.setData({
				'fileList': [...fileList, {
					...file,
					'status': 'loading'
				}],
				'srcList': this.data.srcList || [],
			});
			const length = fileList.length;

			const task = wx.uploadFile({
				url: `https://pan-yz.chaoxing.com/upload?_token=${token}`,
				filePath: file.url,
				name: 'file',
				formData: {
					'puid': this.data.userinfo.uid
				},
				success: res => {
					const data = JSON.parse(res.data);
					if (data.result) {
						log.debug("图片上传结果", data)
						util.showInfo("图片上传成功")
						this.setData({
							[`fileList[${length}].status`]: 'done',
							[`srcList[${length}]`]: data.objectId,
						});
					} else {
						util.showInfo(data.msg)
						this.handleRemove()
					}

				},
			});
			task.onProgressUpdate((res) => {
				this.setData({
					[`fileList[${length}].percent`]: Math.floor(res.progress * 0.99),
				});
			});
		})
	},
	handleRemove(e) { // 删除图片
		const index = e?.detail?.index || this.data.fileList.length - 1;
		this.data.fileList.splice(index, 1);
		this.data.srcList.splice(index, 1);
		this.setData({
			'fileList': this.data.fileList,
			'srcList': this.data.srcList,
		});
	},

	back() { // 返回
		const tabs = ["login", "courses", "activities", "signin"];
		this.setData({
			'tab': tabs[(tabs.indexOf(this.data.tab) || 1) - 1],
		})
	},

	onShareAppMessage() { // 分享
		return {
			'title': '学习通签到助手',
			'imageUrl': '/static/image/share.png',
		}
	}
})
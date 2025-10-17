# Chatbot

## Hướng dẫn cài đặt

1. Đảm bảo đường dẫn đang trỏ tới thư mục dự án `/../chatbot`. Chạy lệnh `pnpm i` để cài đặt các package cần thiết.

2. Tạo file `.env` trong thư mục gốc của dự án, với các biến tương tự như trong file `.env.example`.

3. Tạo cơ sở dữ liệu [mongodb](https://www.mongodb.com/products/self-managed/community-edition), sau đó copy **connection string** làm giá trị cho biến `DATABASE_URL`.

4. Kiểm tra kết nối và tạo database mới bằng cách chạy lệnh `npx prisma generate`. Nếu kết nối thành công, chạy `npx prisma db push` để đảm bảo kết nối được thiết lập với database.

5. Đặt giá trị cho biến `NEXT_PUBLIC_BASE_URL` bằng đường dẫn gốc của website.

6. Đặt giá trị ngẫu nhiên cho biến `BETTER_AUTH_SECRET`. Đặt giá trị cho biến `BETTER_AUTH_URL` chính là đường dẫn gốc của website (ví dụ: với trang web có địa chỉ là _example.com_ thì giá trị của biến `BETTER_AUTH_URL` là _https://example.com_)

7. Thiết lập thông tin cho tài khoản **admin** bằng cách đặt giá trị cho các biến sau:
    - `ADMIN_EMAIL`: Địa chỉ email dùng để đăng nhập cho cho tài khoản **admin**.
    - `ADMIN_PASSWORD`: Mật khẩu cho tài khoản **admin**.
    - `ADMIN_NAME`: Tên của tài khoản **admin**.

8. Chạy lệnh `npm run seed` để khởi tạo tài khoản **admin** trong database.

9. Thiết lập tài khoản **Google**:
    - Truy cập vào [Google Cloud Console](https://console.cloud.google.com/apis/dashboard) và tạo dự án mới.
    - Trong giao diện Google Cloud Console, truy cập `OAuth consent screen > Get started` và đặt tên cho app, địa chỉ email hỗ trợ, loại dự án là **External**
    - Chọn `Create OAuth client ID`, đặt **Application type** là **Web application**. Thiếp lập tên cho auth-service (nên để trùng với tên app). Tại phần `Authorized redirect URIs`, thêm URI trang web với đường dẫn `/api/auth/callback/google` (ví dụ: với trang web có địa chỉ là _example.com_ thì thêm URI _https://example.com/api/auth/callback/google_), và `https://developers.google.com/oauthplayground`. Sau khi chọn **Create**, copy `Client ID` và `Client secret` và thay lần lượt vào các biến `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`.
    - Truy cập vào [Google API Library](https://console.cloud.google.com/apis/library), tìm **Google Calendar API** và **Gmail API** và enable.
    - Truy cập vào [OAuth consent screen](https://console.cloud.google.com/auth/overview), chọn tab `Data Access`, chọn lần lượt các scope sau: `openid`, `.../auth/userinfo.profile`, `.../auth/userinfo.email` và thêm manual scope `https://www.googleapis.com/auth/calendar`.
    - Do sử dụng API của Google Calendar nên app cần được duyệt bởi Google. Ở bước hiện tại, webapp vẫn sẽ ở trạng thái **test**, để người dùng có thể sử dụng với tài khoản Google, truy cập vào tab [Audience](https://console.cloud.google.com/auth/audience) và thêm địa chỉ email của các người dùng được phê duyệt. Chỉ những người dùng này mới có thể đăng nhập và sử dụng app.
    - (Optional) Publish app để mọi tài khoản Google có thể truy cập, vào tab `Audience`, chọn **Publish app** và thực hiện các thủ tục để verify app.

10. Đặt giá trị cho biến `OPENAI_API_KEY` bằng API key của OpenAI. [Xem hướng dẫn lấy API key tại đây](https://platform.openai.com/docs/quickstart).

## 🚀 Production Deployment với Load Balancing

Dự án hiện đã được nâng cấp với khả năng **load balancing** để cải thiện hiệu suất và độ tin cậy:

### Tính năng mới:
- ✅ **Phân phối tải** tự động qua nhiều instance ứng dụng
- ✅ **Health checks** tự động phát hiện và loại bỏ instance không hoạt động
- ✅ **Failover** tự động chuyển traffic sang instance khỏe mạnh
- ✅ **Scaling** dễ dàng tăng/giảm số lượng instance
- ✅ **Rate limiting** và resource management
- ✅ **Zero-downtime deployment** strategy

### Triển khai nhanh:

```bash
# Deploy với 3 replicas (mặc định)
./deploy.sh

# Deploy với số lượng replicas tùy chỉnh
./deploy.sh --replicas 5

# Monitor hệ thống
./monitor.sh
```

### Scaling operations:

```bash
# Scale up (tăng số instance)
docker compose up -d --scale app=5 --no-recreate

# Scale down (giảm số instance)
docker compose up -d --scale app=2 --no-recreate

# Xem trạng thái
docker compose ps
```

### Tài liệu chi tiết:
- **[QUICK_START.md](QUICK_START.md)** - ⚡ Bắt đầu trong 5 phút
- **[SERVER_REQUIREMENTS.md](SERVER_REQUIREMENTS.md)** - 💻 Yêu cầu server và chi phí
- [DEPLOYMENT.md](DEPLOYMENT.md) - 📖 Hướng dẫn deployment đầy đủ
- [LOAD_BALANCING.md](LOAD_BALANCING.md) - 🔧 Chi tiết kỹ thuật load balancing
- [UPGRADE_SUMMARY.md](UPGRADE_SUMMARY.md) - 📋 Tổng quan các thay đổi
- `./monitor.sh` - 📊 Script giám sát hệ thống
- `./deploy.sh --help` - ❓ Xem tất cả options

### Environment Variables mới:

Thêm vào `.env.production`:
```bash
# Số lượng app replicas (default: 3)
APP_REPLICAS=3
```

### Khuyến nghị theo traffic:
- Traffic thấp (< 100 req/min): 2-3 replicas
- Traffic trung bình (100-500 req/min): 3-5 replicas  
- Traffic cao (500-1000 req/min): 5-8 replicas
- Traffic rất cao (> 1000 req/min): 8+ replicas

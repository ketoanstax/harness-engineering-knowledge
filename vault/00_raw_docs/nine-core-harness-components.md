---
id: nine-core-harness-components
aliases:
  - 9 thành phần lõi Harness
  - harness-temp
date: 2026-05-24
type: raw-note
summary: "Video transcript bóc tách 9 thành phần cốt lõi của một Harness hiện đại: Outer Loop, Context Manager, Tool/Skill/Registry, Sub-Agent, Built-in Skills, Session Persistence, Dynamic System Prompt, Lifecycle Hooks, Permission Layers."
keywords:
  - harness-components
  - outer-loop
  - context-manager
  - tool-registry
  - sub-agent
  - built-in-skills
  - session-persistence
  - dynamic-system-prompt
  - lifecycle-hooks
  - permission-layers
  - harness-vs-framework
status: "processed"
source: "Video transcript - Harness Engineer là gì?"
---

# 9 Thành Phần Lõi Của Một Harness Hiện Đại (Video Transcript)

## 🤖 AI Summary
> 

## 📝 Notes
3:00 sáng, terminal vẫn chạy. Một season của AN vẫn đang hoạt động, không có ai ngồi trước màn hình. Bạn đang ngủ, code vẫn được mờ. Sở dĩ như vậy là nhờ một thứ tên là Hanus. Nghề đó có tên là Hanus Engineer. Đây là một trong những nghề đáng chú ý nhất của năm 202. Lang grap ôen Asian loop React MCP Cloud Code thuật ngữ xuất hiện khắp nơi ai cũng nhắc tới. Nhưng câu hỏi thực sự là ai nuôi những con AI đó chạy? Ai xây bộ khung để chúng tự hoạt động? Người ta gọi họ là Hanus Engineer. Trong 20 phút tới chúng ta sẽ làm ba

việc. Thứ nhất làm rõ Hanus là gì và đồng thời phân biệt với những thứ không phải là Hanus. Thứ hai, bóc tách chín thành phần lõi của một Hanus hiện đại. Thứ ba, tự viết một Hanus hoàn chỉnh. Không lăng trên, không Frame, khi kết thúc video, bạn sẽ hiểu đủ để xây Hanus cho công ty mình. Chúng ta bắt đầu. Cơ là một Hanus, Cloud Code là một Hanus. Devin là một hanus, là một hanus. Tất cả những AIA bạn đang dùng đều có chung một bộ khung bên trong. Nhưng chính xác Hus là cái gì? Chúng ta vào việc phần một. Hớ là cái

gì? Bạn lướt Twitter của giới lập trình, lướt edit, lướt blog, chỗ nào cũng nhắc tới Hanus. Nhưng hỏi cụ thể nó là gì? Mỗi người trả lời một kiểu. Có người bảo là Lăng Grab, có người bảo là React, có người chỉ vào cơ giờ và nói chính là cái này. Tất cả đều đúng một phần và sai một phần. Để hiểu cho thấu đáo, chúng ta quay về gốc. Hanus trong tiếng Anh gốc có nghĩa là bộ yên cương, là cái khung dây gắn vào con ngựa để nó kéo được xe. Không phải để điều khiển con ngựa mà để dẫn năng lượng của nó vào đúng việc cần làm. Trong AI ý

nghĩa hoàn toàn tương tự. Agent Thanos là bộ khung bao gồm bộ nhớ, công cụ, quyền truy cập, luồng xử lý và các điểm húc an toàn. Bộ khung này bao quanh một AI để AI có thể chạy xuyên suốt nhiều phiên làm việc mà không mất phương hướng, không quên việc cũ và không phá file của bạn. Cơ giờ là một Hanus, Cloud Code là một Hanus, Devin là một hanus, Aer là một hanus. Tất cả các AI coding agent bạn đang dùng đều là Hanus. Đây là chỗ mà 90% người bị nhầm. Lăng trên, lăng grap, autogen, Cru AI đều không phải là Hanus. Chúng là

frameworking khác nhau ở điểm nào? Framework là thư viện bạn gắn vào trong code của mình. Bạn là người cấu hình, bạn là người gọi. Còn Hanus là một sản phẩm hoàn chỉnh. Bạn giao cho nó nhiệm vụ, nó tự cấu hình, nó tự chạy. Một bên bạn lái, một bên nó lái bạn. Vai trò bị đảo ngược hoàn toàn. Bản chất là khác biệt về triết lý. Framework được viết cho lập trình viên dùng. Hus được viết cho AI dùng. Framework có hàng nghìn cách lắp giáp. Hus chỉ có một con đường mang tính định hướng cao. Framework đọc code. Hus đọc.

Hiểu được khác biệt này, bạn sẽ hiểu vì sao cơ giờ hay close code không thể là lăng grap và ngược lại. Vậy Hanus ra để làm gì? Có bốn nhiệm vụ. Thứ nhất, giữ Aon chạy được lâu không sụp đổ sau 20 t. Thứ hai, giữ Aon nhớ mọi thứ nó đã làm dù chạy 4 giờ liền. Thứ ba, giữ Aon không phá hệ thống, không xóa nhầm phài, không pút lên miên. Thứ tư, giữ Aon biết khi nào nên dừng lại hỏi bạn và khi nào có thể tự quyết. Bốn việc nghe có vẻ đơn giản nhưng để làm được cần đúng chín thành phần, chúng ta bóc tách từng cái.

Đây là bản đồ chín thành phần một vòng ngoài lúp. H quản lý contact 3 skill và tool 4 sub agent 5 buttin kill 6 lưu trữ season 7 lắp giáp system pro 8 lay hook 9 permission và an toàn hai thành phần đầu là bắt buộc thiếu chúng thì không còn là hus bảy thành phần sau là cấp độ trưởng thành càng đầy đủ hus càng hoàn thiện chúng ta đi vào từng phần một vòng oai lú trái tim của mọi hanus nghe có vẻ đơn giản nhưng đây lại là chỗ phần lớn Đến người bị hiểu lầm ngay từ bước đầu. Cấu trúc như sau. Khi chưa

xong, model suy nghĩ, model gọi tool đọc kết quả rồi nghĩ tiếp. Lặp đi lặp lại cho tới khi model tự trả về stock reason bằng enter. Mỗi vòng model nhận toàn bộ contact, cùm các tin nhắn cũ và kết quả tool cũ rồi quyết định bước tiếp theo. Nhưng điều quan trọng hơn nằm ở đây. Vòng là nơi duy nhất trong toàn bộ Hanus được phép gọi model. Không có thành phần nào khác gọi model trực tiếp. Bộ quản lý contex không gọi model. Tâng permission không gọi model. Chỉ có vòng lập này. Tại sao lại như vậy? Vì khi bạn tập

trung toàn bộ logic, gọi model về một chỗ, bạn kiểm soát được Tamchy, kiểm soát được Rech và kiểm soát được Hook. Và quan trọng nhất, bạn có một điểm duy nhất để dò lỗi khi mọi thứ trục chặc. Mọi thành phần khác gồm contex, tool, permission, hook đều tồn tại để phục vụ vòng lặp này chạy lâu hơn và an toàn hơn. Hiểu được điều này, bạn sẽ hiểu vì sao Hanus có kiến trúc đúng như nó đang có. Hai quản lý contex. Vấn đề thực tế cửa sổ contact có hạn 200.000 token nghe có vẻ lớn nhưng chạy vài tiếng là đầy. Mà

khi đầy Aon bắt đầu quên đầu quên đuôi. Chất lượng output giảm rõ rệt. Hanus giải quyết bằng ba chiến lược một giữ nguyên những gì quan trọng đặc biệt là con tch của tách hiện tại và kết quả tool gần đây. Hai tóm tắt. Gom các tin nhấn cũ gọi model tóm tắt thành vài dòng rồi thay thế bằng bảng tóm tắt đó. Bạn loại bỏ những gì đã hoàn toàn lỗi thời. Ngưỡng compact thông thường là 18 tin nhắn. Khi vượt ngưỡng giữ lại bốn tin nhắn gần nhất và tóm tắt phần còn lại. Tỉ lệ này không phải ngẫu nhiên. Đủ ngắn

để giải phóng contact, đủ dài để Aon không mất mạch. Điểm thú vị là việc tóm tắt được thực hiện bởi chính model. Bạn gửi contex cho model và yêu cầu hãy tóm tắt nội dung này thành 10 dòng quan trọng nhất. Model tóm bạn thay thế. Nhờ vậy bản tóm tắt vẫn giữ được ngữ nghĩa của domain. Đây là chỗ phân biệt junior với senior Hanord Engineer. Quyết sai cửa sổ contex sẽ đầy đúng lúc Aon đang do lỗi cho một tách quan trọng nhất. Quyết đúng Aon chạy hết 8 tiếng vẫn tỉnh táo. BQ và tool đây là chỗ hay bị gộp làm một

nhưng thực ra rất khác nhau. Tool là primitive là những hành động cơ bản nhất zit file back edit file grab uffect. Mỗi tool có một ít cây mà Jon mô tả input. Agent gọi tool bằng cách trả về Jon đúng xe. Hanus nhận thực thi và trả kết quả về. Một Hanus có một bộ tool cơ bản dùng được ở mọi nơi. Q thì khác. Q là các file hướng dẫn gắn theo từng project cụ thể. Ví dụ bạn có một kill tên là chuyển đổi dữ liệu cho đây. Tab bịch. Nội dung là một phài mà giải thích bước một sao lưu. Bước hai chạy migration bước ba

verify số dỏng. Agent đọc skill này và biết rằng khi gặp yêu cầu di trú dữ liệu, hãy làm theo đúng thứ tự đó. Tun trả lời câu hỏi: "Tôi có thể làm gì?" Kill trả lời câu hỏi: "Làm theo thứ tự nào?" Một bên là viên gạch mang tính phổ quát, một bên là bản vẽ gắn riêng với từng project. Ở giữa là Regit. Regi biết project này có những kill nào, tool nào. Khi Aon cần, Aon hỏi Regit và Regit trả về danh sách đúng ngữ cảnh. Bộ Tool phổ quát, bộ kill riêng theo project. Ric điều phối ở giữa. Đây là kiến trúc

bốn sub. Phần này cần thận trọng sai một bước là hỏng cả season. Khi tách quá lớn ví dụ tái cấu trúc toàn bộ phân hệ xác thực, viết kiểm thử, cập nhật tài liệu agent chính sẽ quá tải. Con tách đầy rất nhanh, sự chú ý bị phân tán. Agent bắt đầu làm sai. Giải pháp là sinh ra sub agent. Agent chính không giao toàn bộ contex của nó cho sub agent. Nó chỉ giao đúng những gì subent cần. Gồm tách rõ ràng, file liên quan và permission tối thiểu. Cấp B dần chạy trong season riêng, hoàn toàn cô lập. Khi xong chỉ

trả lại kết quả chứ không trả lại toàn bộ lịch sử làm việc. Cách làm này tương tự như khi bạn giao việc cho một thực tập sinh. Bạn không kể cho họ bạn đang làm gì cả tuần. Bạn chỉ nói file này, tách này xong thì báo sub vận hành đúng như vậy. Lỗi thường gặp nhất là truyền toàn bộ contex của agent chính vào suben. Kết quả sub quá tải ngay từ đầu. Conch bị nhô những thứ sub agent không cần biết. Output kém chất lượng. Trong Hanus của chúng tôi có ba bộ sub agent dựng sẵn gồm Explore, General, Verify.

Mỗi bộ có tập permission và system prom khác nhau. Dùng đúng bộ sub agent chạy sạch sẽ. Nutin que khác với các do người dùng tự định nghĩa cho project. Q bạn viết là hướng dẫn cụ thể cho codebase của bạn, cho UFLO của team bạn. Beauting Cill là phần hanus đã đóng gói sẵn. Điểm quan trọng là A biết tự động sử dụng khi cần mà không cần bạn nhắc. Ví dụ điển hình bộ tool xử lý PDF khi gặp file PDF. Bộ Tool xử lý actual khi gặp Xler. Trả cứu tài liệu trên web khi cần xử lý ảnh khi gặp ảnh. Những skill này có tính phổ

quát dùng được trên bất kỳ project nào. Đây là một trong những điểm khác biệt lớn nhất giữa cloud code cơ và Aer. Không phải vì model mạnh hay yếu mà vì bộ kill rộng hay hẹp. Han nào có nhiều build skill chất lượng hơn, A của nó xử lý được nhiều loại tách hơn mà không cần người dùng phải cấu hình thêm. Đây cũng là chỗ các vender Hanus đang cạnh tranh khốc liệt nhất hiện nay. Sáu lưu chữ season. Câu hỏi đặt ra rất đơn giản. Một season dài 4 tiếng máy CR giữa chừng có mất hết hay không? Câu trả lời đối với một Hanus đúng nghĩa là

không bao giờ mất. Cơ chế hoạt động như sau. Mỗi tơn gồm mỗi tin nhắn mỗi lần gọi tool. Mỗi kết quả tool đều được ghi ngay ra một file dây son e theo kiểu appen only. Không đợi xong tách mới ghi không giữ trong bộ nhớ. Ghi ngay flash ngày từng dòng một. File Jon L dạng lý tưởng cho việc này. Appen có chi phí hằng số về thời gian, không cần khóa toàn bộ file và C giữa chừng cũng không làm hỏng dữ liệu đã ghi. Mỗi dòng độc lập khi khởi động lại sau Cra A đọc lại file từ đầu, chạy lại từng sự kiện, dựng

lại mảng tin nhắn như cũ và tiếp tục từ đúng chỗ nó đã dừng. Agent thậm chí không cần biết là đã có c xảy ra. Đây cũng là lý do. Trong phiên bản mới nhất, Antropic đã tách hẳn Seon thành một lớp độc lập. Chon sống tách khỏi tiến trình của Hanus và có thể tiếp tục từ bất kỳ máy nào có cùng file dây son eo đó. Bảy, lắp giáp system prom. Đây là phần gây bất ngờ nhất với hầu hết mọi người khi lần đầu đọc mã nguồn của một hanus. Bạn có thể nghĩ rằng system prom là một chuỗi cố định dán cứng trong code. Hoàn

toàn không phải. System prom là một pipe. Nó được lắp giáp lại ở đầu mỗi season từ nhiều nguồn khác nhau. Phần một. Static cap là nội dung cốt lõi của Hanus không thay đổi theo project. Đặt ở đâu? Thân thiện với cát. Model có thể cá phần này giữa các lần gọi giúp tiết kiệm token. Phần hai còn tách động. Hus đi từ thư mục hiện tại leo ngược lên hệ thống tệp gom mọi file têncloud.md. Aenton.md hoặc cloud.md. Mỗi file được nối vào có ngân sách riêng. Mặc định 4000 token cho mỗi file tổng con tách động có một ngân sách chung là 12.000

token. Vượt ngưỡng phần dư sẽ bị cắt bớt. Kết quả là cùng một hanus, cùng một model. Nhưng khi bạn mở project ra thì prom khác hẳn project. Agent luôn biết nó đang làm việc trong contex của project nào mà không cần bạn giải thích lại từ đầu ở mỗi season. 8. L x cầu húc là khoảnh khắc giữa các bước giữa lúc model quyết định gọi một tool và lúc tool đó thực sự chạy có một khoảng khoảng đó chính là chỗ bạn cài húc vào. Có bốn húc chính trong một hanus. Pretol code chạy trước khi tool thực thi. Post tool c chạy sau khi tool

hoàn tất. On error khi tool lỗi hoặc model gặp lỗi. On compaction khi contact bị nén lại. Dùng để làm gì? Pretol code để ghi lại lần gọi tool. Quét nội dung xem có lộ khóa bí mật hay không. App giới hạn tần suất. Pool C để cập nhật The Lam đếm số token đã dùng on error để rechar với prom đã được viết lại hoặc chuyển sang cho người xử lý on compaction để lưu lịch sử cũ ra file lưu chữ trước khi bị xóa. Một Hanus engineer giỏi là người biết đặt húc đúng chỗ không thừa và không thiếu. Húc thừa mỗi

lần gọi tool phải chạy thêm hàng loạt việc. Hệ thống chậm rõ rệt. Húc thiếu lúc do lỗi không có nhất ký để lần. Đây cũng là chỗ doanh nghiệp tùy biến nhiều nhất so với bản mã nguồn mở. Chín permission và an toàn. Đây là lớp cuối cùng và là lớp giúp bạn yên tâm khi AN làm việc suốt đêm. Không theo kiểu chặn hết để an toàn, cũng không theo kiểu cho phép hết để thuận tiện mà phân tầng theo mức độ rủi ro. Ba mức read only agent chỉ được đọc không được ghi. US AN được ghi trong thư mục Project không được đụng ra ngoài. Full A ghi mọi

nơi và cần xác nhận tường minh từ bạn. Cơ chế phân loại động cùng một tool bass nhưng lệnh els thì tự động cho qua ở mức rid. Lệnh bị phân loại là full và cần xác nhận cùng một tool phân loại theo nội dung lệnh chứ không theo tên tool. Đây là điều mà frame UC không có. Framework không phân loại lệnh. Framework không có khái niệm A đang chạy ở mức permission nào. Framework cứ chạy là chạy. Bạn tự lo phần còn lại. Một hanus có lớp permission là hanus bạn có thể tin tưởng để giao cho tách dài ngày.

Không có nó bạn phải ngồi canh liên tục. Đây là điểm phân biệt một hà nus thật sự với một chatbot wrapper. Tổng kết chín thành phần o loop contact kill và tôn sub bay dần đưa tin kill thần chystem prom hook permittion đủ chín bạn có một hanus hiện đại thiếu bạn chỉ có một chatbot vòng đời ngắn phần hai kết thúc phần ba phần thú vị nhất tự xây dựng thuần pyth thần không frame chúng ta bắt đầu đây là cấu trúc tổng thể một Park tên Hanus gồm chín module mỗi cái đảm nhiệm một vai trò riêng vòng lặp chính contex

to baj các lệnh tích hợp sẵn lưu trữ season lắp giáp prom hook và phân quyền thêm một module nữa để bọc lại API của model bên ngoài là project demo có file cloud.md MD phải chạy chính, phải test và phải khởi động. 17 test không phụ thuộc frame UC nào. Do mình mở từng phần. File loop là trái tim của Hanus, một agent với máy thất run nhận vào một mục tiêu dạng steing. Đầu tiên lắp giáp system prom từ thư mục hiện tại. Khởi tạo danh sách tin nhắn rỗng vào vòng lặp tối đa 100 bước. Mỗi vòng nếu danh sách

tin nhắn quá dài thì nén lại trước sau đó gọi mod phản hồi. Nếu modal báo xong việc return luôn. Nếu model đồ muốn gọi tool dispar tool đó gắn kết quả vào giành sách rồi lặp tiếp. Hết số bước vẫn chưa xong thì báo lỗi tham out tổng cộng 30 dòng không phụ thuộc gì bên ngoài. Đây là toàn bộ động cơ contact, tool permission đều được tiêm vào từ bên ngoài. File contact law việc quản lý độ dài hội thoại contact manager là một data cls có hai tham số ngưỡng nén mặc định 18 tin nhắn và số tin nhắn gần nhất cần giữ lại

mặc định bốn. Khi được gọi, nó đếm số tin nhắn hiện tại. Nếu còn dưới ngưỡng không làm gì. Nếu vượt ngưỡng, tách phần đầu ra, tóm tắt lại bằng model rồi trả về một danh sách mới cồm bản tóm tắt đó và bốn tin nhắn cuối cùng. Quan trọng là nó không sửa danh sách cũ tại chỗ, nó trả về danh sách mới hoàn toàn. Cách làm này dễ test hơn, dễ dò lỗi hơn nhiều. File tool định nghĩa cách đăng ký và tra cứu tool. Tool là một day tên, mô tả xham số dạng dây son, hàm xử lý và mức permission yêu cầu. Tol registry lưu tất

cả vào một từ điển. Muốn thêm tô thì gọi register, muốn lấy ra thì tra theo tên, nếu không có thì báo lỗi. Còn một metus trả về danh sách mô tả để truyền vào lần gọi API để model biết tool nào đang khả dụng. Khi model trả về yêu cầu gọi tool, vòng lặp tra cứu resistry, kiểm tra permission, gọi hàm xử lý rồi gắn kết quả vào tin nhắn. Đơn giản vậy thôi, mua tư điển không có decorator kib không tự dò code. Mọi tool đều phải đăng ký tường minh, ai đọc vào cũng biết hệ thống đang có gì. F subention định nghĩa ba kiểu sub agent

dựng sẵn. Explore chỉ có quyền đọc dùng để đọc file và tìm kiếm. System prom nhắc rõ chỉ được đọc thôi. General quyền US Space đầy đủ tool dùng để thực thi việc chính. Verify quyền USpace có thêm bass để chạy test dùng để xác nhận thay đổi. Bà kiểu này đủ xử lý 90% ưu kết rồi. File persistent law việc lưu và phục hồi season khi khởi tạo nó nhận đường dẫn file và tự tạo thư mục tra nếu chưa có. Mỗi lần có sự kiện mới nó serite thành dây son kể cả de và các kiểu đặc biệt rồi ghi thêm vào cuối phile ngay lập tức

không chờ. Khi cần phục hồi đọc lại từng dòng parcera trả về danh sách sự kiện theo thứ tự. Không có cát, không có buffer phức tạp. Cra giữa chừng thì khởi động lại là chạy tiếp được chính xác từ điểm dừng. File prom lo việc lắp giáp system prom trước mỗi lần gọi model. Bắt đầu bằng phần khung tĩnh. Phần này ít thay đổi nên cá hit rất cao. Tiếp theo nó đi ngược lên cây thư mục từ vị trí hiện tại thu thập tất cả file cloud.md và agent.md Em đi gặp được mỗi file có ngân sách token riêng tổng cũng có giới hạn

chung nếu vượt thì cắt bớt cuối cùng nối tất cả lại xong. File permission định nghĩa bám mức phân quyền chỉ đọc workpay và toàn quyền dưới dạng steing có một bảng điểm số để so sánh giữa các mức khi cần phân loại một lệnh bass nó tách lệnh ra rồi kiểm tra từ khóa đầu tiên các lệnh như els cắt grab thì xếp vào nhóm chỉ đọc các lệnh như sudo kin thì xếp vào nhóm toàn quyền còn lại thì pay trước khi chạy bất kỳ tool nào so sánh mức permission của tool với mức được cấp cho agent đủ thì cho chạy không đủ thì chặn lớp này nhỏ nhưng

giúp Bạn yên tâm hơn rất nhiều khi để Aon tự chạy. Vậy vì sao bây giờ là thời điểm vàng của Han Engineer? Vì 2026 là năm mà bản chất AI đang chuyển dịch từ Copilot ngôi cạnh bạn để code sang AN tự hành tự chạy mà không cần bạn. Và mọi công ty đang dùng AI để code đều sẽ cần ít nhất một Hanus engineer để xây Hanus riêng cho Bay của họ. Cung chưa có cầu đang bùng nổ. Lương ở Mỹ sáu chữ số là mức sàn. Ở Việt Nam đã bắt đầu xuất hiện vị trí Mine trả gấp đôi mặt bằng chung. Trong tương lai gần sẽ không còn AI

trung trúng nữa, sẽ là AI cho tự động hóa email tiếp thị, AI cho giả soát hợp đồng pháp lý, AI cho giám sát vận hành bệnh viện, AI cho sảng lọc khách hàng tiêm năng trong Pipin bán hàng, AI cho quản lý kho trong sản xuất. Mỗi lĩnh vực có đặc thù riêng gồm tên file, quy trình, tool nội bộ và mô hình permission. Tất cả đều khác nhau hoàn toàn. Không thể dùng chung một Hanus chung chung cho tất cả, bắt buộc phải tinh chỉnh riêng. Và đây cũng là cơ hội lớn nhất trong 6 đến 12 tháng tới. Người nào hiểu cả kỹ thuật Hus lẫn nghiệp vụ

của một lĩnh vực, ví dụ ngân hàng, y tế, hậu cần, người đó có một lợi thế mà AI không thể sao chép. Vì Hus engineer không chỉ cần biết code, cần biết domain đủ sâu đến mức biết được cái gì có thể ủy quyền cho AN và cái gì bắt buộc phải có người kiểm duyệt. Muốn vào nghề có ba bước. Một, xem lại video này hiểu rõ chín thành phần. Hai, Clon Repo Demo, tự viết lại từ đầu. Ba chọn một lĩnh vực bạn đã có kinh nghiệm, ví dụ ngân hàng, thương mại, điện tử hoặc sản xuất và xây Hanus cho lĩnh vực đó. Khi đã có một Hanus Production ready

trong tay, bạn sẽ không thiếu cơ hội việc làm. Cảm ơn bạn đã theo dõi đến phút thứ 20. Nếu video này hữu ích, hãy bấm thích, bình luận và đăng ký để ủng hộ kênh. Hẹn gặp lại.


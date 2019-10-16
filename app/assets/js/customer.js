const api_url = "http://127.0.0.1:3000";

function getCustomers() {
    $.ajax({
        url: `${api_url}/customer/all`,
        type: 'get',
        contentType: 'application/json',
        success: function(data, textStatus, jqXHR){
            if(data.status === "success"){
                if(jqXHR.status === 200){
                    console.log("data.data",data.data);
                    $('#customers-table').dataTable({
                        data: data.data,
                        destroy: true,
                        columns: [
                            {data: 'name'},
                            {data: 'mobile'},
                            {data: 'company_name'},
                            {data: 'company_website'},
                            {data: 'company_type'},
                            {data: 'tin_number'}
                        ],
                        responsive: true
                    });
                    $('.no_data_found').hide();
                    $('#customers-table').show();
                }
                else if(jqXHR.status === 204){
                    $('#customers-table').hide();
                    $('.no_data_found').html('<h3 class="m-t-15">No Customer Found</h3>');
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            $('#customers-table').hide();
            $('.no_data_found').html('<h3 class="m-t-15">No Customers Found</h3>').show();
            // console.log(jqXHR.responseJSON.message);
            // $(".login_alert_div").empty().hide().addClass('alert-danger').removeClass('alert-success');
            // $(".login_alert_div").text(jqXHR.responseJSON.message).show().fadeTo(5000, 500).slideUp(500);
        }
    });
    return false;
}
getCustomers();

$(document).ready(function () {
    $(document).on('click', '.logout-root', function () {
        let cookieName = "inv_cookie";
        // function getCookie(name) {
        //     var nameEQ = name + "=";
        //     var ca = document.cookie.split(';');
        //     for(var i=0;i < ca.length;i++) {
        //         var c = ca[i];
        //         while (c.charAt(0)==' ') c = c.substring(1,c.length);
        //         if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        //     }
        //     return null;
        // }
        // function eraseCookie(cookieName) {
        //     document.cookie = name+'=; Max-Age=-99999999;';
        // }
        document.cookie = cookieName+'=; Max-Age=-99999999;';

        $.ajax({
            url: `${api_url}/user/logout`,
            type: 'GET',
            success: function(data, textStatus, jqXHR){
                if(jqXHR.status == 200){
                    window.location = "login.html";
                }
            },
            error: function(data,bb,cc){
                console.log("Error logging out")
            }
        });

        return false;
    });

    $(document).on('submit', '.add-customer-form', function () {
        const name = $('input[name="name"]').val();
        const mobile = $('input[name="mobile"]').val();
        const company_name = $('input[name="company_name"]').val();
        const company_website = $('input[name="company_website"]').val();
        const company_type = $('select[name="company_type"]').val();
        const tin_number = $('input[name="tin_number"]').val();

        let form_data = {name,mobile,company_name,company_type,tin_number};
        if(company_website.length && company_website !== "http://"){
            form_data = {...form_data,company_website}
        }
        form_data = JSON.stringify(form_data);

        $.ajax({
            url: `${api_url}/customer/new`,
            type: 'POST',
            contentType :'application/json',
            headers: {
                'Access-Control-Allow-Origin': api_url,
                'Access-Control-Allow-Credentials': 'true'
            },
            data: form_data,
            success: function(data, textStatus, jqXHR){
                if(jqXHR.status == 200){
                    $('.customer_alert_div').removeClass('alert-danger').addClass('alert-success');
                    $(".customer_alert_div").html("Inserted successfully").show().fadeTo(2000, 500).slideUp(500).hide(0,function () {
                        getCustomers();
                    });
                }
                else{
                    $(".customer_alert_div").empty().hide().removeClass('alert-success').addClass('alert-danger');
                    $(".customer_alert_div").text("Something didn't work").show().fadeTo(2000, 500).slideUp(500);
                }
            },
            error: function(data,bb,cc){
                $(".customer_alert_div").removeClass('alert-success').addClass('alert-danger')
                $(".customer_alert_div").text("Something didn't work").show(0).delay(3000).hide(0);
            }
        });
        return false;
    });

    $(document).on('click', ".add_new_customer", function () {
        $('.add-customer-form').show();
        $('.remove_new_customer').show();
        $('.add_new_customer').hide();
    })

    $(document).on('click', ".remove_new_customer", function () {
        $('.add-customer-form').hide();
        $('.add-customer-form').trigger("reset");
        $('.remove_new_customer').hide();
        $('.add_new_customer').show();
    })
});
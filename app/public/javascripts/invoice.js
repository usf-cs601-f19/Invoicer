getInvoices();
function getInvoices() {

    // Store user entered data to local storage
    $.ajax({
        url: `${api_url}/invoice/all`,
        type: 'get',
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", auth);
        },
        contentType: 'application/json',
        success: function(data, textStatus, jqXHR){
            if(jqXHR.status === 200){
                $('#invoices-table').dataTable({
                    data: data.data,
                    destroy: true,
                    columns: [
                        {data: 'customer_name'},
                        {data: 'due_amt'},
                        {data: 'inv_number'},
                        {data: 'inv_date'},
                        {data: 'due_date'},
                        {data: 'created_on'}
                    ],
                    responsive: true
                });
                $('.no_data_found').hide();
                $('#invoices-table').show();
            }
            else if(jqXHR.status === 204){
                $('#invoices-table').hide();
                $('.no_data_found').html('<h3 class="m-t-15">No Invoice Found</h3>');
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            console.log(jqXHR.responseJSON);
            $('#invoices-table').hide();
            $('.no_data_found').html('<h3 class="m-t-15">No Invoice Found</h3>');
            // $(".login_alert_div").empty().hide().addClass('alert-danger').removeClass('alert-success');
            // $(".login_alert_div").text(jqXHR.responseJSON.message).show().fadeTo(5000, 500).slideUp(500);
        }
    });
    return false;
}
$(document).ready(function () {

    $(document).on('submit', '.add-invoice-form', function () {
        const name = $('input[name="name"]').val();
        const label = $('input[name="label"]').val();
        const description = $('input[name="description"]').val();
        const state_id = $('select[name="state_id"]').val();
        const tax_val = $('input[name="tax_val"]').val().trim() ;
        const discount = $('input[name="discount"]').val().trim() ;
        const shipping_charge = $('input[name="shipping_charge"]').val().trim() ;
        const prepaid_amt = $('input[name="prepaid_amt"]').val().trim() ;
        const notes = $('input[name="notes"]').val().trim() ;
        const terms = $('input[name="terms"]').val().trim() ;
        const inv_date = $('input[name="inv_date"]').val().trim() ;
        const due_date = $('input[name="due_date"]').val().trim() ;
        const sub_total = $('input[name="sub_total"]').val().trim() ;
        const total_amt = $('input[name="total_amt"]').val().trim() ;
        const due_amt = $('input[name="due_amt"]').val().trim() ;
        const customer_id = $('select[name="customer_id"]').val();

        // Radio
        const custom_tax = $('input[name="custom_tax"]').val().trim() ;

        let products = [];
        $.each($('.products'), function () {
            products.push({
                "product_id": $(this).find('input[name="products_desc"]').val(),
                "quantity": $(this).find('input[name="products_qty"]').val(),
                "rate": $(this).find('input[name="products_rate"]').val()
            });
        });

        let form_data = {inv_number, customer_id, inv_date, due_date, sub_total, total_amt, due_amt, custom_tax,products};
        if (state_id.length) {
            form_data = {...form_data,state_id}
        }
        if (tax_val.length) {
            form_data = {...form_data,tax_val}
        }
        if (discount.length) {
            form_data = {...form_data,discount}
        }
        if (shipping_charge.length) {
            form_data = {...form_data,shipping_charge}
        }
        if (prepaid_amt.length) {
            form_data = {...form_data,prepaid_amt}
        }
        if (notes.length) {
            form_data = {...form_data,notes}
        }
        if (terms.length) {
            form_data = {...form_data,terms}
        }

        form_data = JSON.stringify(form_data);

        $.ajax({
            url: `${api_url}/invoice/new`,
            type: 'POST',
            contentType :'application/json',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", auth);
            },
            data: form_data,
            success: function(data, textStatus, jqXHR){
                if(jqXHR.status == 200){
                    $('.invoice_alert_div').removeClass('alert-danger').addClass('alert-success');
                    $(".invoice_alert_div").html("Inserted successfully").show().fadeTo(2000, 500).slideUp(500).hide(0,function () {
                        getInvoices();
                        $('.add-invoice-form').hide();
                        $('.add-invoice-form').trigger("reset");
                        $('.remove_new_invoice').hide();
                        $('.add_new_invoice').show();
                    });
                }
                else{
                    $(".invoice_alert_div").empty().hide().removeClass('alert-success').addClass('alert-danger');
                    $(".invoice_alert_div").text("Something didn't work").show().fadeTo(2000, 500).slideUp(500);
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                $(".invoice_alert_div").empty().hide().addClass('alert-danger').removeClass('alert-success');

                if(jqXHR.hasOwnProperty('responseJSON') && jqXHR.responseJSON.hasOwnProperty('message'))
                    $(".invoice_alert_div").text(jqXHR.responseJSON.message).show().fadeTo(5000, 500).slideUp(500);
                else
                    $(".invoice_alert_div").text("Something didn't work").show(0).delay(3000).hide(0);
            }
        });
        return false;
    });

    $(document).on('click', ".add_new_invoice", function () {
        $('.add-invoice-form').show();
        $('.remove_new_invoice').show();
        $('.add_new_invoice').hide();
    })

    $(document).on('click', ".remove_new_invoice", function () {
        $('.add-invoice-form').hide();
        $('.add-invoice-form').trigger("reset");
        $('.remove_new_invoice').hide();
        $('.add_new_invoice').show();
    })
});
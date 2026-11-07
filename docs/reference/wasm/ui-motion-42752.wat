  (func (;42752;) (type 1) (param i32 i32)
    (local i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366199
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3359836
      call 2180
      i32.const 3395032
      call 2180
      i32.const 4366199
      i32.const 1
      i32.store8
    end
    i32.const 3359836
    i32.load
    local.tee 1
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 1
    else
      local.get 1
      call 60460
      i32.const 3359836
      i32.load
    end
    i32.load offset=92
    i32.load offset=108
    local.get 2
    i32.const 12
    i32.add
    i32.const 3395032
    i32.load
    call 45693
    local.get 0
    i32.load offset=120
    local.tee 1
    if  ;; label = @1
      local.get 1
      local.get 2
      i32.load offset=12
      i32.const 1
      i32.eq
      i32.const 0
      call 43174
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)

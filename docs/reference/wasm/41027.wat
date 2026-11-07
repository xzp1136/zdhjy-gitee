  (func (;41027;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 32
    i32.sub
    local.tee 1
    global.set 0
    i32.const 4365128
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3376692
      call 2180
      i32.const 3376700
      call 2180
      i32.const 3376340
      call 2180
      i32.const 3375984
      call 2180
      i32.const 3357344
      call 2180
      i32.const 3383824
      call 2180
      i32.const 3383832
      call 2180
      i32.const 3383812
      call 2180
      i32.const 3349928
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3387788
      call 2180
      i32.const 3385844
      call 2180
      i32.const 3388504
      call 2180
      i32.const 3390816
      call 2180
      i32.const 3390820
      call 2180
      i32.const 3388508
      call 2180
      i32.const 3387776
      call 2180
      i32.const 3385836
      call 2180
      i32.const 3387912
      call 2180
      i32.const 3388512
      call 2180
      i32.const 3390824
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3387916
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3351356
      call 2180
      i32.const 3350984
      call 2180
      i32.const 3360988
      call 2180
      i32.const 3360992
      call 2180
      i32.const 3353920
      call 2180
      i32.const 3364756
      call 2180
      i32.const 3364752
      call 2180
      i32.const 3364760
      call 2180
      i32.const 3482608
      call 2180
      i32.const 3482600
      call 2180
      i32.const 3473764
      call 2180
      i32.const 3480656
      call 2180
      i32.const 3482744
      call 2180
      i32.const 3482612
      call 2180
      i32.const 3435440
      call 2180
      i32.const 3482596
      call 2180
      i32.const 3434852
      call 2180
      i32.const 3461728
      call 2180
      i32.const 3482604
      call 2180
      i32.const 4365128
      i32.const 1
      i32.store8
    end
    local.get 1
    i32.const 0
    i32.store offset=24
    local.get 1
    i32.const 0
    i32.store offset=20
    local.get 1
    i32.const 0
    i32.store offset=16
    local.get 1
    i32.const 0
    i32.store offset=12
    local.get 1
    i32.const 0
    i32.store offset=8
    local.get 0
    local.get 0
    local.get 1
    call 41028
    i32.store offset=36
    i32.const 3357344
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    i32.const 4367474
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357344
      call 2180
      i32.const 4367474
      i32.const 1
      i32.store8
    end
    i32.const 3357344
    i32.load
    local.tee 2
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 2
    else
      local.get 2
      call 60460
      i32.const 3357344
      i32.load
    end
    i32.load offset=92
    i32.load
    local.tee 2
    if  ;; label = @1
      local.get 2
      local.get 0
      i32.load offset=36
      i32.load offset=28
      i32.const 0
      call 44405
    end
    local.get 0
    i32.load offset=36
    local.tee 2
    i32.load offset=20
    local.set 14
    local.get 2
    i32.load offset=16
    local.set 8
    local.get 1
    i32.const 0
    i32.store offset=24
    i32.const 3388508
    i32.load
    local.set 3
    local.get 0
    i32.load offset=72
    local.tee 2
    local.get 2
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 3
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 2
        i32.load offset=12
        local.set 3
        local.get 2
        i32.const 0
        i32.store offset=12
        local.get 3
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 2
        i32.load offset=8
        i32.const 0
        local.get 3
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 2
      i32.const 0
      i32.store offset=12
    end
    i32.const 3390820
    i32.load
    local.set 3
    local.get 0
    i32.load offset=68
    local.tee 2
    local.get 2
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 3
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 2
        i32.load offset=12
        local.set 3
        local.get 2
        i32.const 0
        i32.store offset=12
        local.get 3
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 2
        i32.load offset=8
        i32.const 0
        local.get 3
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 2
      i32.const 0
      i32.store offset=12
    end
    i32.const 3349928
    i32.load
    call 1900
    local.tee 15
    i32.const 3383812
    i32.load
    call 35517
    local.get 8
    i32.load offset=12
    i32.const 0
    i32.gt_s
    if  ;; label = @1
      i32.const 1
      local.set 11
      loop  ;; label = @2
        local.get 8
        local.get 7
        local.get 1
        i32.const 28
        i32.add
        i32.const 3387848
        i32.load
        call 50458
        local.get 1
        i32.load offset=28
        local.set 5
        i32.const 3360992
        i32.load
        local.tee 2
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 2
          call 60460
          i32.const 3360992
          i32.load
          local.set 2
        end
        i32.const 3376340
        i32.load
        local.set 3
        local.get 2
        i32.load offset=92
        i32.load
        local.set 2
        local.get 1
        local.get 5
        i32.store offset=28
        block  ;; label = @3
          local.get 2
          local.get 1
          i32.const 28
          i32.add
          local.get 1
          i32.const 20
          i32.add
          local.get 3
          call 34286
          i32.eqz
          if  ;; label = @4
            local.get 1
            local.get 5
            i32.store offset=28
            i32.const 3359088
            i32.load
            local.get 1
            i32.const 28
            i32.add
            call 2193
            local.set 2
            i32.const 3482744
            i32.load
            local.get 2
            i32.const 0
            call 48011
            local.set 2
            i32.const 3356428
            i32.load
            local.tee 3
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 3
              call 60460
            end
            local.get 2
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          block  ;; label = @4
            local.get 1
            i32.load offset=20
            i32.load offset=16
            local.tee 2
            if  ;; label = @5
              local.get 2
              i32.load offset=12
              i32.const 0
              i32.gt_s
              br_if 1 (;@4;)
            end
            local.get 1
            local.get 5
            i32.store offset=28
            i32.const 3359088
            i32.load
            local.get 1
            i32.const 28
            i32.add
            call 2193
            local.set 2
            i32.const 3482608
            i32.load
            local.get 2
            i32.const 0
            call 48011
            local.set 2
            i32.const 3356428
            i32.load
            local.tee 3
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 3
              call 60460
            end
            local.get 2
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          i32.const 0
          local.set 2
          i32.const 3351356
          i32.load
          call 1900
          local.tee 9
          i32.const 3387776
          i32.load
          call 35169
          local.get 1
          i32.load offset=20
          i32.load offset=16
          local.tee 3
          i32.load offset=12
          i32.const 0
          i32.gt_s
          if  ;; label = @4
            loop  ;; label = @5
              local.get 3
              local.get 2
              local.get 1
              i32.const 28
              i32.add
              i32.const 3387848
              i32.load
              call 50458
              local.get 1
              i32.load offset=28
              local.set 3
              block  ;; label = @6
                i32.const 0
                call 56067
                i32.load8_u offset=624
                if  ;; label = @7
                  i32.const 3364756
                  i32.load
                  local.tee 4
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 4
                    call 60460
                    i32.const 3364756
                    i32.load
                    local.set 4
                  end
                  i32.const 3376692
                  i32.load
                  local.set 6
                  local.get 4
                  i32.load offset=92
                  i32.load
                  local.set 4
                  local.get 1
                  local.get 3
                  i32.store offset=28
                  local.get 4
                  local.get 1
                  i32.const 28
                  i32.add
                  local.get 6
                  call 34443
                  i32.eqz
                  br_if 1 (;@6;)
                  i32.const 3387788
                  i32.load
                  local.set 4
                  local.get 1
                  local.get 3
                  i32.store offset=28
                  local.get 9
                  local.get 1
                  i32.const 28
                  i32.add
                  local.get 4
                  call 50463
                  br 1 (;@6;)
                end
                i32.const 0
                call 56067
                local.set 4
                i32.const 3376692
                i32.load
                local.set 6
                local.get 4
                i32.load offset=220
                local.set 4
                local.get 1
                local.get 3
                i32.store offset=28
                local.get 4
                local.get 1
                i32.const 28
                i32.add
                local.get 6
                call 34443
                i32.eqz
                br_if 0 (;@6;)
                i32.const 3387788
                i32.load
                local.set 4
                local.get 1
                local.get 3
                i32.store offset=28
                local.get 9
                local.get 1
                i32.const 28
                i32.add
                local.get 4
                call 50463
              end
              local.get 2
              i32.const 1
              i32.add
              local.tee 2
              local.get 1
              i32.load offset=20
              i32.load offset=16
              local.tee 3
              i32.load offset=12
              i32.lt_s
              br_if 0 (;@5;)
            end
          end
          local.get 9
          i32.load offset=12
          i32.const 0
          i32.le_s
          if  ;; label = @4
            local.get 1
            local.get 5
            i32.store offset=28
            i32.const 3359088
            i32.load
            local.get 1
            i32.const 28
            i32.add
            call 2193
            local.set 2
            i32.const 3482604
            i32.load
            local.get 2
            i32.const 0
            call 48011
            local.set 2
            i32.const 3356428
            i32.load
            local.tee 3
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 3
              call 60460
            end
            local.get 2
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          block (result i32)  ;; label = @4
            i32.const 0
            local.get 11
            i32.eqz
            br_if 0 (;@4;)
            drop
            local.get 8
            local.get 7
            local.get 1
            i32.const 28
            i32.add
            i32.const 3387848
            i32.load
            call 50458
            local.get 1
            i32.load offset=28
            i32.const 206
            i32.eq
            if  ;; label = @5
              i32.const 1
              local.get 0
              i32.load offset=64
              i32.const 2
              i32.eq
              br_if 1 (;@4;)
              drop
            end
            local.get 8
            local.get 7
            local.get 1
            i32.const 28
            i32.add
            i32.const 3387848
            i32.load
            call 50458
            i32.const 0
            local.get 1
            i32.load offset=28
            i32.const 303
            i32.ne
            br_if 0 (;@4;)
            drop
            local.get 0
            i32.load offset=64
            i32.const 3
            i32.eq
          end
          local.set 20
          i32.const 1
          local.set 16
          local.get 14
          i32.load offset=12
          local.get 7
          i32.gt_s
          if  ;; label = @4
            local.get 14
            local.get 7
            local.get 1
            i32.const 28
            i32.add
            i32.const 3387848
            i32.load
            call 50458
            local.get 1
            i32.load offset=28
            local.tee 16
            i32.const 0
            i32.le_s
            br_if 1 (;@3;)
          end
          i32.const 0
          local.set 17
          loop  ;; label = @4
            local.get 9
            i32.const 0
            local.get 9
            i32.load offset=12
            i32.const 0
            call 48614
            local.get 1
            i32.const 28
            i32.add
            i32.const 3387848
            i32.load
            call 50458
            local.get 1
            i32.const 0
            i32.store offset=16
            local.get 1
            i32.load offset=28
            local.set 6
            block  ;; label = @5
              block  ;; label = @6
                i32.const 0
                call 56067
                i32.load8_u offset=624
                if  ;; label = @7
                  i32.const 3364756
                  i32.load
                  local.tee 2
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 2
                    call 60460
                    i32.const 3364756
                    i32.load
                    local.set 2
                  end
                  i32.const 3376700
                  i32.load
                  local.set 3
                  local.get 2
                  i32.load offset=92
                  i32.load
                  local.set 2
                  local.get 1
                  local.get 6
                  i32.store offset=28
                  local.get 2
                  local.get 1
                  i32.const 28
                  i32.add
                  local.get 1
                  i32.const 16
                  i32.add
                  local.get 3
                  call 34286
                  br_if 1 (;@6;)
                  local.get 1
                  local.get 6
                  i32.store offset=28
                  i32.const 3359088
                  i32.load
                  local.get 1
                  i32.const 28
                  i32.add
                  call 2193
                  local.set 2
                  i32.const 3482596
                  i32.load
                  local.get 2
                  i32.const 0
                  call 48011
                  local.set 2
                  i32.const 3356428
                  i32.load
                  local.tee 3
                  i32.load offset=116
                  i32.eqz
                  if  ;; label = @8
                    local.get 3
                    call 60460
                  end
                  local.get 2
                  i32.const 0
                  call 55817
                  br 2 (;@5;)
                end
                i32.const 0
                call 56067
                local.set 2
                i32.const 3376700
                i32.load
                local.set 3
                local.get 2
                i32.load offset=220
                local.set 2
                local.get 1
                local.get 6
                i32.store offset=28
                local.get 2
                local.get 1
                i32.const 28
                i32.add
                local.get 1
                i32.const 16
                i32.add
                local.get 3
                call 34286
                br_if 0 (;@6;)
                local.get 1
                local.get 6
                i32.store offset=28
                i32.const 3359088
                i32.load
                local.get 1
                i32.const 28
                i32.add
                call 2193
                local.set 2
                i32.const 3482600
                i32.load
                local.get 2
                i32.const 0
                call 48011
                local.set 2
                i32.const 3356428
                i32.load
                local.tee 3
                i32.load offset=116
                i32.eqz
                if  ;; label = @7
                  local.get 3
                  call 60460
                end
                local.get 2
                i32.const 0
                call 55817
                br 1 (;@5;)
              end
              i32.const 0
              local.set 2
              block (result i32)  ;; label = @6
                i32.const 0
                local.get 1
                i32.load offset=16
                local.tee 3
                i32.load offset=40
                local.get 0
                i32.load offset=64
                i32.ne
                br_if 0 (;@6;)
                drop
                i32.const 3383832
                i32.load
                local.set 4
                local.get 1
                local.get 3
                i32.load offset=8
                i32.store offset=28
                i32.const 0
                local.get 15
                local.get 1
                i32.const 28
                i32.add
                local.get 4
                call 35532
                br_if 0 (;@6;)
                drop
                local.get 0
                i32.load offset=64
                i32.const 1
                i32.ne
              end
              local.set 18
              i32.const 3350984
              i32.load
              call 1900
              local.tee 12
              i32.const 3385836
              i32.load
              call 35169
              local.get 1
              i32.load offset=16
              local.tee 4
              i32.load offset=32
              local.tee 3
              i32.load offset=12
              i32.const 0
              i32.gt_s
              if  ;; label = @6
                loop  ;; label = @7
                  local.get 3
                  local.get 2
                  local.get 1
                  i32.const 28
                  i32.add
                  i32.const 3385856
                  i32.load
                  call 50458
                  block  ;; label = @8
                    block  ;; label = @9
                      local.get 1
                      i32.load offset=28
                      local.tee 3
                      if  ;; label = @10
                        local.get 3
                        i32.load offset=12
                        local.tee 4
                        i32.const 1
                        i32.gt_s
                        br_if 1 (;@9;)
                      end
                      local.get 1
                      local.get 6
                      i32.store offset=28
                      i32.const 3359088
                      i32.load
                      local.get 1
                      i32.const 28
                      i32.add
                      call 2193
                      local.set 3
                      i32.const 3482612
                      i32.load
                      local.get 3
                      i32.const 0
                      call 48011
                      local.set 3
                      i32.const 3356428
                      i32.load
                      local.tee 4
                      i32.load offset=116
                      i32.eqz
                      if  ;; label = @10
                        local.get 4
                        call 60460
                      end
                      local.get 3
                      i32.const 0
                      call 55817
                      br 1 (;@8;)
                    end
                    local.get 3
                    local.get 4
                    i32.const 1
                    i32.sub
                    local.get 1
                    i32.const 28
                    i32.add
                    i32.const 3387848
                    i32.load
                    call 50458
                    local.get 1
                    i32.load offset=28
                    local.set 19
                    local.get 3
                    i32.const 0
                    local.get 3
                    i32.load offset=12
                    i32.const 1
                    i32.sub
                    i32.const 0
                    call 48614
                    local.get 1
                    i32.const 28
                    i32.add
                    i32.const 3387848
                    i32.load
                    call 50458
                    local.get 1
                    i32.const 0
                    i32.store offset=12
                    local.get 1
                    i32.load offset=28
                    local.set 3
                    i32.const 0
                    call 56067
                    i32.load8_u offset=624
                    local.set 4
                    i32.const 0
                    call 56067
                    local.set 5
                    block  ;; label = @9
                      local.get 4
                      if  ;; label = @10
                        i32.const 3375984
                        i32.load
                        local.set 4
                        local.get 5
                        i32.load offset=212
                        local.set 5
                        local.get 1
                        local.get 3
                        i32.store offset=28
                        local.get 5
                        local.get 1
                        i32.const 28
                        i32.add
                        local.get 1
                        i32.const 12
                        i32.add
                        local.get 4
                        call 34286
                        br_if 1 (;@9;)
                        local.get 1
                        local.get 3
                        i32.store offset=28
                        i32.const 3359088
                        i32.load
                        local.get 1
                        i32.const 28
                        i32.add
                        call 2193
                        local.set 3
                        local.get 1
                        local.get 1
                        i32.load offset=16
                        i32.load offset=8
                        i32.store offset=4
                        i32.const 3359088
                        i32.load
                        local.get 1
                        i32.const 4
                        i32.add
                        call 2193
                        local.set 4
                        i32.const 3480656
                        i32.load
                        local.get 3
                        local.get 4
                        i32.const 0
                        call 48227
                        local.set 3
                        i32.const 3356428
                        i32.load
                        local.tee 4
                        i32.load offset=116
                        i32.eqz
                        if  ;; label = @11
                          local.get 4
                          call 60460
                        end
                        local.get 3
                        i32.const 0
                        call 55817
                        br 2 (;@8;)
                      end
                      i32.const 3375984
                      i32.load
                      local.set 4
                      local.get 5
                      i32.load offset=216
                      local.set 5
                      local.get 1
                      local.get 3
                      i32.store offset=28
                      local.get 5
                      local.get 1
                      i32.const 28
                      i32.add
                      local.get 1
                      i32.const 12
                      i32.add
                      local.get 4
                      call 34286
                      br_if 0 (;@9;)
                      local.get 1
                      local.get 3
                      i32.store offset=28
                      i32.const 3359088
                      i32.load
                      local.get 1
                      i32.const 28
                      i32.add
                      call 2193
                      local.set 3
                      local.get 1
                      local.get 1
                      i32.load offset=16
                      i32.load offset=8
                      i32.store offset=4
                      i32.const 3359088
                      i32.load
                      local.get 1
                      i32.const 4
                      i32.add
                      call 2193
                      local.set 4
                      i32.const 3480656
                      i32.load
                      local.get 3
                      local.get 4
                      i32.const 0
                      call 48227
                      local.set 3
                      i32.const 3356428
                      i32.load
                      local.tee 4
                      i32.load offset=116
                      i32.eqz
                      if  ;; label = @10
                        local.get 4
                        call 60460
                      end
                      local.get 3
                      i32.const 0
                      call 55817
                      br 1 (;@8;)
                    end
                    local.get 1
                    i32.load offset=12
                    local.tee 4
                    i32.eqz
                    br_if 0 (;@8;)
                    local.get 4
                    i32.load offset=12
                    local.tee 4
                    i32.const 0
                    i32.le_s
                    br_if 0 (;@8;)
                    block  ;; label = @9
                      local.get 1
                      i32.load offset=16
                      local.tee 5
                      i32.load offset=36
                      local.tee 10
                      if  ;; label = @10
                        local.get 2
                        local.get 10
                        i32.load offset=12
                        i32.lt_s
                        br_if 1 (;@9;)
                      end
                      local.get 1
                      local.get 5
                      i32.load offset=8
                      i32.store offset=28
                      i32.const 3359088
                      i32.load
                      local.get 1
                      i32.const 28
                      i32.add
                      call 2193
                      local.set 3
                      i32.const 3461728
                      i32.load
                      local.get 3
                      i32.const 0
                      call 48011
                      local.set 3
                      i32.const 3356428
                      i32.load
                      local.tee 4
                      i32.load offset=116
                      i32.eqz
                      if  ;; label = @10
                        local.get 4
                        call 60460
                      end
                      local.get 3
                      i32.const 0
                      call 55817
                      br 1 (;@8;)
                    end
                    i32.const 0
                    local.get 4
                    i32.const 0
                    call 48614
                    local.set 4
                    local.get 1
                    i32.load offset=12
                    local.get 4
                    local.get 1
                    i32.const 28
                    i32.add
                    i32.const 3387916
                    i32.load
                    call 50458
                    local.get 1
                    i32.load offset=28
                    i32.load offset=8
                    local.set 5
                    i32.const 3351356
                    i32.load
                    call 1900
                    local.tee 4
                    i32.const 3387776
                    i32.load
                    call 35169
                    i32.const 3387788
                    i32.load
                    local.set 10
                    local.get 1
                    local.get 5
                    i32.store offset=28
                    local.get 4
                    local.get 1
                    i32.const 28
                    i32.add
                    local.get 10
                    call 50463
                    i32.const 3387788
                    i32.load
                    local.set 10
                    local.get 1
                    local.get 19
                    i32.store offset=28
                    local.get 4
                    local.get 1
                    i32.const 28
                    i32.add
                    local.get 10
                    call 50463
                    local.get 12
                    local.get 4
                    i32.const 3385844
                    i32.load
                    call 50463
                    i32.const 3360988
                    i32.load
                    call 1900
                    local.tee 4
                    local.get 19
                    i32.store offset=16
                    local.get 4
                    local.get 5
                    i32.store offset=12
                    local.get 4
                    local.get 3
                    i32.store offset=8
                    local.get 1
                    i32.load offset=16
                    i32.load offset=36
                    local.get 2
                    local.get 1
                    i32.const 28
                    i32.add
                    i32.const 3385856
                    i32.load
                    call 50458
                    local.get 4
                    local.get 1
                    i32.load offset=28
                    i32.store offset=20
                    local.get 0
                    i32.load offset=72
                    local.get 4
                    i32.const 3388504
                    i32.load
                    call 50463
                    local.get 1
                    local.get 4
                    i32.load offset=16
                    local.get 13
                    i32.add
                    local.tee 13
                    i32.store offset=24
                  end
                  local.get 2
                  i32.const 1
                  i32.add
                  local.tee 2
                  local.get 1
                  i32.load offset=16
                  local.tee 4
                  i32.load offset=32
                  local.tee 3
                  i32.load offset=12
                  i32.lt_s
                  br_if 0 (;@7;)
                end
              end
              local.get 12
              i32.load offset=12
              i32.const 0
              i32.le_s
              br_if 0 (;@5;)
              local.get 11
              local.get 20
              i32.and
              local.set 6
              local.get 18
              if  ;; label = @6
                i32.const 3383824
                i32.load
                local.set 2
                local.get 1
                local.get 4
                i32.load offset=8
                i32.store offset=28
                local.get 15
                local.get 1
                i32.const 28
                i32.add
                local.get 2
                call 35541
                drop
              end
              i32.const 3364752
              i32.load
              call 1900
              local.tee 2
              local.get 1
              i32.load offset=16
              local.tee 3
              i32.load offset=8
              i32.store offset=8
              local.get 2
              local.get 3
              i32.load offset=12
              i32.store offset=12
              local.get 2
              local.get 3
              i32.load offset=16
              i32.store offset=16
              local.get 2
              local.get 3
              i32.load offset=20
              i32.store offset=20
              local.get 2
              local.get 3
              i32.load offset=24
              i32.store offset=24
              local.get 3
              i32.load offset=28
              local.set 4
              local.get 2
              local.get 12
              i32.store offset=32
              local.get 2
              local.get 4
              i32.store offset=28
              local.get 2
              local.get 3
              i32.load offset=36
              i32.store offset=36
              i32.const 3364760
              i32.load
              call 1900
              local.set 3
              local.get 0
              i32.load offset=68
              local.tee 4
              i32.load offset=12
              local.set 5
              local.get 3
              local.get 6
              i32.store8 offset=18
              local.get 3
              local.get 18
              i32.store8 offset=17
              local.get 3
              i32.const 0
              i32.store8 offset=16
              local.get 3
              local.get 2
              i32.store offset=12
              local.get 3
              local.get 5
              i32.store offset=8
              local.get 4
              local.get 3
              i32.const 3390816
              i32.load
              call 50463
              local.get 6
              i32.eqz
              local.get 11
              i32.and
              local.set 11
            end
            local.get 17
            i32.const 1
            i32.add
            local.tee 17
            local.get 16
            i32.ne
            br_if 0 (;@4;)
          end
        end
        local.get 7
        i32.const 1
        i32.add
        local.tee 7
        local.get 8
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 0
    local.get 13
    i32.store offset=28
    local.get 0
    local.get 13
    i32.store offset=24
    i32.const 3353920
    i32.load
    i32.const 6
    call 2185
    local.tee 2
    i32.const 3473764
    i32.load
    i32.store offset=16
    local.get 1
    local.get 0
    i32.load offset=72
    i32.load offset=12
    i32.store offset=8
    local.get 2
    local.get 1
    i32.const 8
    i32.add
    i32.const 0
    call 53141
    i32.store offset=20
    local.get 2
    i32.const 3435440
    i32.load
    i32.store offset=24
    local.get 2
    local.get 1
    i32.const 24
    i32.add
    i32.const 0
    call 53141
    i32.store offset=28
    local.get 2
    i32.const 3434852
    i32.load
    i32.store offset=32
    local.get 1
    local.get 0
    i32.load offset=68
    i32.load offset=12
    i32.store offset=8
    local.get 2
    local.get 1
    i32.const 8
    i32.add
    i32.const 0
    call 53141
    i32.store offset=36
    local.get 2
    i32.const 0
    call 48226
    local.set 2
    i32.const 3356428
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    local.get 2
    i32.const 0
    call 55817
    local.get 0
    local.get 1
    call 41029
    local.get 0
    local.get 0
    i32.load offset=36
    local.get 0
    i32.load offset=72
    local.get 1
    call 41030
    local.set 3
    i32.const 4365138
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3367948
      call 2180
      i32.const 4365138
      i32.const 1
      i32.store8
    end
    i32.const 3367948
    i32.load
    call 1900
    local.tee 2
    local.get 3
    i32.store offset=20
    local.get 2
    local.get 0
    i32.store offset=16
    local.get 2
    i32.const 0
    i32.store offset=8
    local.get 0
    local.get 2
    i32.const 0
    call 48887
    drop
    local.get 1
    i32.const 32
    i32.add
    global.set 0)
